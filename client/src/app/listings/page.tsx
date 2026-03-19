'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Activity, Package, Briefcase } from 'lucide-react';
import { useGetListingsQuery } from '@/store/listingsApi';
import { useGetCategoriesQuery } from '@/store/categoriesApi';
import { Navbar } from '@/components/Navbar';

// Fallback minimal icon mapping for categories
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('dev') || n.includes('tech')) return <Activity className="w-5 h-5" />;
  if (n.includes('design') || n.includes('art')) return <Activity className="w-5 h-5" />;
  return <Briefcase className="w-5 h-5" />;
};

export default function Home() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId]);

  const { data: listingsData, isLoading: isLoadingListings, isFetching } = useGetListingsQuery({ 
    limit: 12, 
    page: currentPage,
    search: searchQuery || undefined,
    categoryId: selectedCategoryId || undefined
  });
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const filteredListings = listingsData?.data?.listings || [];
  const pagination = listingsData?.data?.pagination;
  const categories = categoriesData?.data?.categories || [];

  return (
    <div className="layout-container flex h-full grow flex-col">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="px-6 py-8 lg:px-20 max-w-screen-2xl mx-auto w-full flex-1">
        {/* Hero Section */}
        <div className="mb-10 animate-fade-in-up stagger-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-nexa-style">
            Service Marketplace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Discover and procure elite professional services for your business.
          </p>
        </div>

        {/* Dynamic Category Filters Strip */}
        <div className="mb-10 animate-fade-in-up stagger-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth">
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 font-bold text-sm transition-all focus:outline-none ${!selectedCategoryId ? 'bg-primary text-background-dark' : 'bg-slate-200 dark:bg-primary/10 text-slate-700 dark:text-slate-200 hover:bg-primary/20'}`}
            >
              <Grid className="w-5 h-5" />
              All Services
            </button>
            
            {isLoadingCategories ? (
              <span className="text-slate-500 text-sm animate-pulse px-4 shrink-0">Loading categories...</span>
            ) : (
              categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 font-semibold text-sm transition-all focus:outline-none ${selectedCategoryId === cat.id ? 'bg-primary text-background-dark' : 'bg-slate-200 dark:bg-primary/10 text-slate-700 dark:text-slate-200 hover:bg-primary/20'}`}
                >
                  {getCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Listing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up stagger-4">
          {isLoadingListings ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 h-[380px] animate-pulse flex flex-col p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl mb-6"></div>
                <div className="w-24 h-3 bg-primary/20 rounded mb-3"></div>
                <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 rounded mb-8"></div>
                <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between">
                  <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="w-24 h-8 bg-primary/20 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredListings.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No services found matching your criteria.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div key={listing.id} className="group flex flex-col bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 hover:border-primary/40 transition-all duration-300 abstract-bg shadow-sm hover:shadow-md">
                <div className="p-6 flex flex-col flex-1 relative">
                  
                  {/* Category Image Mapping / Placeholder */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                       {listing.images && listing.images.length > 0 ? (
                         <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <Briefcase className="w-6 h-6" />
                       )}
                    </div>
                  </div>
                  
                  {/* Titles */}
                  <div className="mb-6">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 line-clamp-1">
                      {listing.category?.name || 'Service'}
                    </p>
                    <h3 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight font-nexa-style group-hover:text-primary transition-colors line-clamp-2">
                      {listing.title}
                    </h3>
                  </div>
                  
                  {/* Seller Profiling */}
                  <div className="flex items-center gap-3 mb-8 mt-auto pt-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 text-primary font-bold text-xs uppercase">
                      {listing.seller?.name ? listing.seller.name.substring(0,2) : 'VN'}
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Vendor</p>
                      <p className="text-slate-700 dark:text-slate-200 text-xs font-semibold truncate max-w-[120px]">
                        {listing.seller?.name || 'Network Vendor'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Pricing and Action */}
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-primary/5">
                    <div className="flex flex-col">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                        {listing.listingType === 'QUOTE' ? 'Pricing' : 'Starting at'}
                      </p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white font-nexa-style">
                        {listing.price ? `$${listing.price.toLocaleString()}` : 'Quote'}
                      </p>
                    </div>
                    <Link href={`/listings/${listing.id}`} className="bg-primary text-background-dark px-4 py-2 rounded-lg font-bold text-sm hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all">
                      View Details
                    </Link>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4 animate-fade-in-up">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isFetching}
              className="px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-200 dark:bg-[#252a1a] text-slate-700 dark:text-slate-200 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-primary/10"
            >
              Previous
            </button>
            <span className="text-slate-600 dark:text-slate-400 font-bold text-sm bg-slate-200/50 dark:bg-background-dark px-4 py-2 rounded-lg border border-primary/5">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages || isFetching}
              className="px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-200 dark:bg-[#252a1a] text-slate-700 dark:text-slate-200 hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-primary/10"
            >
              Next
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-primary/10 px-6 py-10 lg:px-20 bg-background-light dark:bg-background-dark">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-primary">
              <span className="font-bold text-xs leading-none">V</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-nexa-style">Verchool B2B</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Verchool Marketplace. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Privacy</Link>
            <Link href="/" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Terms</Link>
            <Link href="/" className="text-slate-500 hover:text-primary text-sm font-medium transition-colors">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
