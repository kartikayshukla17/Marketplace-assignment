'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGetListingsQuery } from '@/store/listingsApi';
import { useGetCategoriesQuery, type Category } from '@/store/categoriesApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronDown, LayoutGrid, ArrowLeft, X, ShoppingBag } from 'lucide-react';
import { ListingSkeleton } from '@/components/ui/skeleton';

// ==========================================
// CONSTANTS
// ==========================================
const ITEMS_PER_PAGE = 12;

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ListingsPage() {
    // State
    const [search, setSearch] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [categorySearch, setCategorySearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [page, setPage] = useState(1);

    // Data fetching
    const { data, isLoading, error } = useGetListingsQuery({ search: search || undefined, page, limit: ITEMS_PER_PAGE });
    const { data: categoriesData } = useGetCategoriesQuery();

    const allListings = data?.data?.listings || [];
    const pagination = data?.data?.pagination;
    const categories = categoriesData?.data?.categories || [];

    // ==========================================
    // DERIVED STATE (Memoized for performance)
    // ==========================================

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        return categories.filter((cat) =>
            cat.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    // Filter listings by selected category (client-side)
    const filteredListings = useMemo(() => {
        if (!selectedCategoryId) return allListings;
        return allListings.filter((listing) => listing.categoryId === selectedCategoryId);
    }, [allListings, selectedCategoryId]);

    // Get selected category name for display
    const selectedCategory = useMemo(() => {
        return categories.find((cat) => cat.id === selectedCategoryId);
    }, [categories, selectedCategoryId]);

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleCategorySelect = (categoryId: string | null) => {
        setSelectedCategoryId(categoryId);
        setIsDropdownOpen(false);
        setCategorySearch('');
    };

    const clearCategoryFilter = () => {
        setSelectedCategoryId(null);
        setCategorySearch('');
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Marketplace Listings</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/my-orders">
                            <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-700">
                                <ShoppingBag size={16} className="mr-2" />
                                My Purchases
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-700">
                                <LayoutGrid size={16} className="mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8 relative z-10">

                {/* Search & Filter */}
                <div className="relative z-20 flex flex-col md:flex-row gap-4 mb-8 bg-zinc-800/40 p-4 rounded-2xl border border-zinc-700/80 backdrop-blur-sm">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <Input
                            placeholder="Search listings..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="relative w-full md:w-72 flex gap-2">
                        {/* Dropdown Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex-1 flex items-center justify-between bg-zinc-900/50 border border-zinc-700 text-white rounded-xl h-11 px-4 transition-all hover:border-zinc-600 focus:border-indigo-500/50"
                        >
                            <span className={selectedCategory ? 'text-white' : 'text-zinc-500'}>
                                {selectedCategory ? selectedCategory.name : 'All Categories'}
                            </span>
                            <ChevronDown size={18} className={`text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Clear Button (separate, not nested) */}
                        {selectedCategory && (
                            <button
                                type="button"
                                onClick={clearCategoryFilter}
                                className="h-11 w-11 flex items-center justify-center bg-zinc-900/50 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl transition-all"
                                aria-label="Clear category filter"
                            >
                                <X size={16} />
                            </button>
                        )}

                        {/* Dropdown Panel */}
                        {isDropdownOpen && (
                            <div className="absolute z-30 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
                                {/* Search within dropdown */}
                                <div className="p-2 border-b border-zinc-700">
                                    <Input
                                        placeholder="Search categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="bg-zinc-900/50 border-zinc-600 text-white placeholder:text-zinc-500 h-9 text-sm rounded-lg"
                                        autoFocus
                                    />
                                </div>

                                {/* Category Options */}
                                <div className="max-h-48 overflow-y-auto">
                                    {/* "All Categories" option */}
                                    <button
                                        type="button"
                                        onClick={() => handleCategorySelect(null)}
                                        className={`w-full text-left py-3 px-4 hover:bg-zinc-700 transition-colors ${!selectedCategoryId ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-200'
                                            }`}
                                    >
                                        All Categories
                                    </button>

                                    {/* Filtered categories */}
                                    {filteredCategories.length === 0 && categorySearch && (
                                        <div className="py-3 px-4 text-zinc-400 text-sm">No categories found</div>
                                    )}
                                    {filteredCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(category.id)}
                                            className={`w-full text-left py-3 px-4 hover:bg-zinc-700 transition-colors ${category.id === selectedCategoryId ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-200'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Filter Badge */}
                {selectedCategory && (
                    <div className="mb-6 flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Filtered by:</span>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-sm flex items-center gap-2 border border-indigo-500/20">
                            {selectedCategory.name}
                            <button onClick={clearCategoryFilter} className="hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </span>
                    </div>
                )}

                {/* Listings Grid */}
                {isLoading ? (
                    <ListingSkeleton />
                ) : error ? (
                    <p className="text-center py-20 text-red-400">Failed to load listings</p>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-400 text-lg">No listings found matching your criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredListings.map((listing) => (
                                <Link key={listing.id} href={`/listings/${listing.id}`} className="block group h-full">
                                    <Card className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm h-full hover:border-indigo-500/50 hover:bg-zinc-800/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle className="line-clamp-1 text-lg font-semibold text-zinc-50 group-hover:text-indigo-300 transition-colors">{listing.title}</CardTitle>
                                                <span className="shrink-0 px-2 py-1 rounded-md bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-600">{listing.category?.name || 'Uncategorized'}</span>
                                            </div>
                                            <CardDescription className="line-clamp-2 text-zinc-300 mt-2 text-sm">
                                                {listing.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-end mt-2">
                                                <div>
                                                    <p className="text-xs text-zinc-400 mb-1">Price</p>
                                                    <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                        {listing.price
                                                            ? `$${listing.price.toLocaleString()}`
                                                            : 'Contact for Quote'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-zinc-400">Seller</p>
                                                    <p className="text-sm text-zinc-200 font-medium">
                                                        {listing.seller?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-12">
                                <div className="flex items-center gap-3 bg-zinc-800/40 p-4 rounded-xl border border-zinc-700 backdrop-blur-sm">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="border-zinc-600 bg-transparent text-zinc-200 hover:text-white hover:bg-zinc-700 w-24"
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2 text-sm text-zinc-300 flex items-center">
                                        Page <span className="text-white font-medium mx-1">{page}</span> of <span className="text-white font-medium mx-1">{pagination.totalPages}</span>
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={page === pagination.totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="border-zinc-600 bg-transparent text-zinc-200 hover:text-white hover:bg-zinc-700 w-24"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
}
