'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useGetListingQuery, useUpdateListingMutation } from '@/store/listingsApi';
import { useGetCategoriesQuery, useCreateCategoryMutation } from '@/store/categoriesApi';
import { useGetMeQuery } from '@/store/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { ArrowLeft, Package, ChevronDown, FileText, Sparkles, DollarSign, Lock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

// ==========================================
// TYPES
// ==========================================
interface EditListingFormData {
    title: string;
    description: string;
    categoryId: string;
    listingType: 'FIXED' | 'QUOTE';
    price?: number;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED';
}

// ==========================================
// MAIN COMPONENT
// ==========================================
function EditListingContent() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Data Fetching
    const { data: userData } = useGetMeQuery();
    const { data, isLoading: isLoadingListing } = useGetListingQuery(id);
    const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
    const { data: categoriesData } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();

    // UI State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const listing = data?.data?.listing;
    const isOwner = userData?.data?.id === listing?.sellerId;
    const categories = categoriesData?.data?.categories || [];

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        return categories.filter((cat) =>
            cat.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    // Check if typed category already exists (case-insensitive)
    const existingCategory = useMemo(() => {
        return categories.find((cat) =>
            cat.name.toLowerCase() === categorySearch.toLowerCase().trim()
        );
    }, [categories, categorySearch]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<EditListingFormData>({
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            listingType: 'FIXED',
            price: 0,
            status: 'DRAFT',
        },
    });

    // Pre-fill form when listing loads
    useEffect(() => {
        if (listing) {
            reset({
                title: listing.title,
                description: listing.description,
                categoryId: listing.categoryId || '',
                listingType: listing.listingType || 'FIXED',
                price: listing.price || undefined,
                status: listing.status,
            });
            // Also set the category search to show current category name
            if (listing.category?.name) {
                setCategorySearch(listing.category.name);
            }
        }
    }, [listing, reset]);

    const selectedStatus = watch('status');
    const selectedListingType = watch('listingType');

    // Clear price when switching to QUOTE mode
    useEffect(() => {
        if (selectedListingType === 'QUOTE') {
            setValue('price', undefined as any);
        }
    }, [selectedListingType, setValue]);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleCategorySelect = (categoryId: string, categoryName: string) => {
        setValue('categoryId', categoryId);
        setCategorySearch(categoryName);
        setIsDropdownOpen(false);
    };

    const onSubmit = async (data: EditListingFormData) => {
        if (!categorySearch.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        setIsSubmitting(true);

        try {
            let categoryId = data.categoryId;

            // If no categoryId is set OR the search doesn't match existing category, create new one
            if (!categoryId || !existingCategory) {
                const trimmedName = categorySearch.trim();

                // Double-check category doesn't exist (case-insensitive)
                const existing = categories.find(
                    (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
                );

                if (existing) {
                    categoryId = existing.id;
                } else {
                    // Create new category
                    const result = await createCategory({ name: trimmedName }).unwrap();
                    if (result.data?.category) {
                        categoryId = result.data.category.id;
                        toast.success(`Category "${trimmedName}" created!`);
                    } else {
                        throw new Error('Failed to create category');
                    }
                }
            }

            // Update the listing
            await updateListing({ id, data: { ...data, categoryId } }).unwrap();
            toast.success('Listing updated successfully!');
            router.push(`/listings/${id}`);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // LOADING & ERROR STATES
    // ==========================================
    if (isLoadingListing) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center text-slate-900 dark:text-white">
                <h2 className="text-2xl font-extrabold font-nexa-style mb-4">Listing Not Found</h2>
                <Link href="/dashboard">
                    <Button className="bg-primary/20 text-primary hover:bg-primary hover:text-background-dark font-bold px-8 h-12">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center text-slate-900 dark:text-white">
                <h2 className="text-2xl font-extrabold font-nexa-style mb-2">Access Denied</h2>
                <p className="text-slate-500 font-medium mb-6">You can only edit your own listings.</p>
                <Link href={`/listings/${id}`}>
                    <Button className="bg-primary/20 text-primary hover:bg-primary hover:text-background-dark font-bold px-8 h-12">
                        View Listing
                    </Button>
                </Link>
            </div>
        );
    }

    if (listing.isBlocked) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center text-slate-900 dark:text-white">
                <div className="bg-red-500/10 p-5 rounded-full mb-6 border border-red-500/20">
                    <Lock size={40} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-extrabold font-nexa-style mb-3">Listing Blocked</h2>
                <p className="text-slate-500 font-medium mb-8 text-center max-w-md">
                    This listing has been blocked by an admin and cannot be edited.
                    Please contact support for more information.
                </p>
                <Link href="/dashboard">
                    <Button className="bg-slate-200 dark:bg-[#252a1a] text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-primary/10 font-bold px-8 h-12">
                        Return to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            {/* Header */}
            <div className="border-b border-primary/5 bg-background-light/40 dark:bg-[#1c2012]/40 animate-fade-in-up stagger-1">
                <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
                    <Link href={`/listings/${id}`} className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm font-bold w-fit uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Listing
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">Edit Listing</h1>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-10 relative z-10 max-w-3xl flex-1 animate-fade-in-up stagger-2">
                <Card className="bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 abstract-bg shadow-sm">
                    <CardHeader className="border-b border-primary/5 p-8 pb-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary/20 rounded-xl text-primary">
                                <Package size={24} />
                            </div>
                            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style">Update Listing</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium ml-16">
                            Modify the details below to update your listing.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Title */}
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Premium Web Development Service"
                                    {...register('title', { required: 'Title is required' })}
                                    className="bg-slate-200/50 dark:bg-black/20 border-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-primary rounded-xl h-14 px-5 font-bold text-lg"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500 font-bold">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Description</Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe your product or service in detail..."
                                    rows={5}
                                    {...register('description', { required: 'Description is required' })}
                                    className="w-full bg-slate-200/50 dark:bg-black/20 border border-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-xl p-5 resize-none font-medium leading-relaxed"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 font-bold">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Category - Searchable Input with Dropdown */}
                            <div className="space-y-3">
                                <Label className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Category</Label>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Select existing or type a new category name</p>

                                <div className="relative">
                                    <Input
                                        value={categorySearch}
                                        onChange={(e) => {
                                            setCategorySearch(e.target.value);
                                            // Clear stored ID if user types a different name
                                            if (existingCategory?.name.toLowerCase() !== e.target.value.toLowerCase().trim()) {
                                                setValue('categoryId', '');
                                            }
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="e.g., Web Development, Design, Marketing"
                                        className="bg-slate-200/50 dark:bg-black/20 border-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-primary rounded-xl h-14 px-5 pr-12 font-bold"
                                    />
                                    <ChevronDown
                                        size={20}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform cursor-pointer hover:text-primary ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    />

                                    {/* Dropdown Options */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-slate-100 dark:bg-[#1c2012] border border-primary/20 rounded-xl shadow-xl overflow-hidden">
                                            <div className="max-h-56 overflow-y-auto">
                                                {filteredCategories.length === 0 ? (
                                                    <div className="py-4 px-5 text-slate-500 text-sm font-medium">
                                                        {categorySearch.trim()
                                                            ? `"${categorySearch.trim()}" will be created as a new category`
                                                            : 'No categories yet. Type to create one.'
                                                        }
                                                    </div>
                                                ) : (
                                                    filteredCategories.map((category) => (
                                                        <button
                                                            key={category.id}
                                                            type="button"
                                                            onClick={() => handleCategorySelect(category.id, category.name)}
                                                            className={`w-full text-left py-4 px-5 transition-colors font-bold ${existingCategory?.id === category.id
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-primary/10 hover:text-primary'
                                                                }`}
                                                        >
                                                            {category.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            {/* Show "will create" hint if typing new name */}
                                            {categorySearch.trim() && !existingCategory && filteredCategories.length > 0 && (
                                                <div className="py-3 px-5 text-xs text-primary font-bold uppercase tracking-widest bg-primary/10">
                                                    Press "Save Changes" to add "{categorySearch.trim()}" as a new category
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!categorySearch.trim() && errors.categoryId && (
                                    <p className="text-sm text-red-500 font-bold">Category is required</p>
                                )}
                            </div>

                            {/* Pricing Mode Toggle */}
                            <div className="space-y-3 pt-4 border-t border-primary/5">
                                <Label className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Pricing Mode</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setValue('listingType', 'FIXED')}
                                        className={`p-5 rounded-xl border-2 text-left transition-all ${selectedListingType === 'FIXED'
                                            ? 'bg-primary/10 border-primary text-slate-900 dark:text-white'
                                            : 'bg-slate-200/50 dark:bg-black/20 border-transparent text-slate-500 hover:border-primary/30 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <div className="font-extrabold font-nexa-style text-lg flex items-center gap-2">
                                            <DollarSign size={20} className={selectedListingType === 'FIXED' ? 'text-primary' : ''} />
                                            Fixed Price
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('listingType', 'QUOTE')}
                                        className={`p-5 rounded-xl border-2 text-left transition-all ${selectedListingType === 'QUOTE'
                                            ? 'bg-primary/10 border-primary text-slate-900 dark:text-white'
                                            : 'bg-slate-200/50 dark:bg-black/20 border-transparent text-slate-500 hover:border-primary/30 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <div className="font-extrabold font-nexa-style text-lg flex items-center gap-2">
                                            <FileText size={20} className={selectedListingType === 'QUOTE' ? 'text-primary' : ''} />
                                            Request Quote
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Price - Only show for Fixed pricing */}
                            {selectedListingType === 'FIXED' && (
                                <div className="space-y-3 animate-fade-in-up">
                                    <Label htmlFor="price" className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Price (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">$</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register('price', { valueAsNumber: true })}
                                            className="pl-10 bg-slate-200/50 dark:bg-black/20 border-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-primary rounded-xl h-14 font-black font-nexa-style text-xl"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="text-sm text-red-500 font-bold">{errors.price.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Status Toggle - Only show for DRAFT listings */}
                            {listing.status === 'DRAFT' && (
                                <div className="space-y-3 pt-4 border-t border-primary/5">
                                    <Label className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Listing Status</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setValue('status', 'DRAFT')}
                                            className={`p-5 rounded-xl border-2 text-left transition-all ${selectedStatus === 'DRAFT'
                                                ? 'bg-slate-300 dark:bg-slate-700/80 border-slate-400 text-slate-900 dark:text-white'
                                                : 'bg-slate-200/50 dark:bg-black/20 border-transparent text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <FileText size={20} className={selectedStatus === 'DRAFT' ? 'text-slate-500 dark:text-slate-300' : ''} />
                                                <span className="font-extrabold font-nexa-style text-lg">Draft</span>
                                            </div>
                                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Not visible to buyers</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setValue('status', 'ACTIVE')}
                                            className={`p-5 rounded-xl border-2 text-left transition-all ${selectedStatus === 'ACTIVE'
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-slate-200/50 dark:bg-black/20 border-transparent text-slate-500 hover:border-primary/30 hover:text-slate-700 dark:hover:text-slate-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Sparkles size={20} className={selectedStatus === 'ACTIVE' ? 'text-primary' : ''} />
                                                <span className="font-extrabold font-nexa-style text-lg">Active</span>
                                            </div>
                                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Visible to all buyers</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-8 border-t border-primary/10">
                                <Link href={`/listings/${id}`} className="flex-1">
                                    <Button
                                        type="button"
                                        className="w-full h-14 text-lg font-bold bg-slate-200 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-primary/10 hover:text-primary transition-colors border border-primary/10 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isUpdating || isSubmitting}
                                    className="flex-1 h-14 text-lg font-bold bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all rounded-xl"
                                >
                                    {isUpdating || isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function EditListingPage() {
    return (
        <ProtectedRoute>
            <EditListingContent />
        </ProtectedRoute>
    );
}
