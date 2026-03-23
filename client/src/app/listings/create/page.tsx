'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateListingMutation } from '@/store/listingsApi';
import { useGetCategoriesQuery, useCreateCategoryMutation } from '@/store/categoriesApi';
import { createListingSchema, type CreateListingInput } from '@/lib/validations/listing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { toast } from 'sonner';
import { ArrowLeft, Package, Sparkles, FileText, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

// Note: Form types are inferred from Zod schema (CreateListingInput)

// ==========================================
// MAIN COMPONENT
// ==========================================
function CreateListingContent() {
    const router = useRouter();
    const [createListing, { isLoading }] = useCreateListingMutation();
    const { data: categoriesData } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();

    // UI State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = categoriesData?.data?.categories || [];

    // Filter categories based on search input
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        return categories.filter((cat) =>
            cat.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    // Check if category name already exists (case-insensitive)
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
        formState: { errors },
    } = useForm<CreateListingInput>({
        resolver: zodResolver(createListingSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            listingType: 'FIXED',
            price: 0,
            status: 'DRAFT',
        },
    });

    const selectedStatus = watch('status');
    const selectedListingType = watch('listingType');

    // Clear price when switching to QUOTE mode to avoid validation errors
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

    const onSubmit: SubmitHandler<CreateListingInput> = async (data) => {
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
                    const result = await createCategory({ name: trimmedName }).unwrap();
                    if (result.data?.category) {
                        categoryId = result.data.category.id;
                        toast.success(`Category "${trimmedName}" created!`);
                    } else {
                        throw new Error('Failed to create category');
                    }
                }
            }

            // Create the listing with the category ID
            await createListing({ ...data, categoryId }).unwrap();
            toast.success('Listing created successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            {/* Header Area */}
            <div className="border-b border-primary/5 bg-background-light/40 dark:bg-[#1c2012]/40 animate-fade-in-up stagger-1">
                <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
                    <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm font-bold w-fit uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">Create New Listing</h1>
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
                            <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style">Listing Details</CardTitle>
                        </div>
                        <CardDescription className="text-slate-500 font-medium ml-16">
                            Fill in the details below to create a new marketplace listing.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                            {/* Title */}
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-slate-900 dark:text-white font-extrabold font-nexa-style tracking-wider text-sm">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Premium Web Development Service"
                                    {...register('title')}
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
                                    {...register('description')}
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
                                                    Press "Create Listing" to add "{categorySearch.trim()}" as a new category
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
                                        <div className="font-extrabold font-nexa-style text-lg">Fixed Price</div>
                                        <div className="text-xs font-medium opacity-80 mt-1 uppercase tracking-widest">Set a specific price</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('listingType', 'QUOTE')}
                                        className={`p-5 rounded-xl border-2 text-left transition-all ${selectedListingType === 'QUOTE'
                                            ? 'bg-primary/10 border-primary text-slate-900 dark:text-white'
                                            : 'bg-slate-200/50 dark:bg-black/20 border-transparent text-slate-500 hover:border-primary/30 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        <div className="font-extrabold font-nexa-style text-lg">Request Quote</div>
                                        <div className="text-xs font-medium opacity-80 mt-1 uppercase tracking-widest">Buyers request pricing</div>
                                    </button>
                                </div>
                            </div>

                            {/* Price (conditional - only for FIXED mode) */}
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

                            {/* Status Toggle */}
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
                                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Save for later, hidden</p>
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
                                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Publish immediately</p>
                                    </button>
                                </div>
                                {errors.status && (
                                    <p className="text-sm text-red-500 font-bold">{errors.status.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-8 border-t border-primary/10">
                                <Link href="/dashboard" className="flex-1">
                                    <Button
                                        type="button"
                                        className="w-full h-14 text-lg font-bold bg-slate-200 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-primary/10 hover:text-primary transition-colors border border-primary/10 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isLoading || isSubmitting}
                                    className="flex-1 h-14 text-lg font-bold bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all rounded-xl"
                                >
                                    {isLoading || isSubmitting ? 'Creating...' : 'Create Listing'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function CreateListingPage() {
    return (
        <ProtectedRoute>
            <CreateListingContent />
        </ProtectedRoute>
    );
}
