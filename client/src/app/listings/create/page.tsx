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
        resolver: zodResolver(createListingSchema),
        defaultValues: {
            title: '',
            description: '',
            categoryId: '',
            listingType: 'FIXED',  // Default to fixed pricing
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
        // Don't allow submission if no category name entered
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
                    // Use existing category
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
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Create New Listing</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-10 relative z-10 max-w-2xl">
                <Card className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-700/50 bg-zinc-800/20">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Package size={20} />
                            </div>
                            <CardTitle className="text-xl text-white">Listing Details</CardTitle>
                        </div>
                        <CardDescription className="text-zinc-300">
                            Fill in the details below to create a new marketplace listing.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-zinc-200">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Premium Web Development Service"
                                    {...register('title')}
                                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-400">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-zinc-200">Description</Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe your product or service in detail..."
                                    rows={4}
                                    {...register('description')}
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl p-3 transition-all resize-none"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-400">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Category - Searchable Input with Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-zinc-200">Category</Label>
                                <p className="text-xs text-zinc-400">Select existing or type a new category name</p>

                                <div className="relative">
                                    <Input
                                        value={categorySearch}
                                        onChange={(e) => {
                                            setCategorySearch(e.target.value);
                                            // Clear the stored ID if user is typing a new name
                                            if (existingCategory?.name.toLowerCase() !== e.target.value.toLowerCase().trim()) {
                                                setValue('categoryId', '');
                                            }
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        placeholder="e.g., Web Development, Design, Marketing"
                                        className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all pr-10"
                                    />
                                    <ChevronDown
                                        size={18}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform cursor-pointer ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    />

                                    {/* Dropdown Options */}
                                    {isDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                            <div className="max-h-48 overflow-y-auto">
                                                {filteredCategories.length === 0 ? (
                                                    <div className="py-3 px-4 text-zinc-400 text-sm">
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
                                                            className={`w-full text-left py-3 px-4 hover:bg-zinc-700 transition-colors ${existingCategory?.id === category.id
                                                                ? 'bg-indigo-500/10 text-indigo-300'
                                                                : 'text-zinc-200'
                                                                }`}
                                                        >
                                                            {category.name}
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            {/* Show "will create" hint if typing new name */}
                                            {categorySearch.trim() && !existingCategory && filteredCategories.length > 0 && (
                                                <div className="py-2 px-4 text-xs text-indigo-400 border-t border-zinc-700 bg-indigo-500/5">
                                                    Press "Create Listing" to add "{categorySearch.trim()}" as a new category
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!categorySearch.trim() && errors.categoryId && (
                                    <p className="text-sm text-red-400">Category is required</p>
                                )}
                            </div>

                            {/* Pricing Mode Toggle */}
                            <div className="space-y-3">
                                <Label className="text-zinc-200">Pricing Mode</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue('listingType', 'FIXED')}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedListingType === 'FIXED'
                                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                                            }`}
                                    >
                                        <div className="font-medium">Fixed Price</div>
                                        <div className="text-xs text-zinc-400 mt-1">Set a specific price</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('listingType', 'QUOTE')}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedListingType === 'QUOTE'
                                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                                            }`}
                                    >
                                        <div className="font-medium">Request Quote</div>
                                        <div className="text-xs text-zinc-400 mt-1">Buyers request pricing</div>
                                    </button>
                                </div>
                            </div>

                            {/* Price (conditional - only for FIXED mode) */}
                            {selectedListingType === 'FIXED' && (
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-zinc-200">Price (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            {...register('price', { valueAsNumber: true })}
                                            className="pl-8 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all"
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="text-sm text-red-400">{errors.price.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Status Toggle */}
                            <div className="space-y-3">
                                <Label className="text-zinc-200">Listing Status</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'DRAFT')}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedStatus === 'DRAFT'
                                            ? 'bg-zinc-700/80 border-zinc-500 text-white'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <FileText size={16} />
                                            <span className="font-medium">Draft</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">Save for later, not visible to buyers</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('status', 'ACTIVE')}
                                        className={`p-4 rounded-xl border text-left transition-all ${selectedStatus === 'ACTIVE'
                                            ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles size={16} />
                                            <span className="font-medium">Active</span>
                                        </div>
                                        <p className="text-xs text-zinc-400">Publish immediately, visible to all</p>
                                    </button>
                                </div>
                                {errors.status && (
                                    <p className="text-sm text-red-400">{errors.status.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Link href="/dashboard" className="flex-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-zinc-600 text-zinc-200 hover:text-white hover:bg-zinc-700 h-12 bg-transparent"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isLoading || isSubmitting}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-12 shadow-lg shadow-indigo-600/20 border-0"
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
