'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetMeQuery } from '@/store/authApi';
import { useGetMyListingsQuery, useDeleteListingMutation } from '@/store/listingsApi';
import { useGetMySellerOrdersQuery, useGetMyBuyerOrdersQuery } from '@/store/ordersApi';
import { useGetMyActivitiesQuery } from '@/store/activityApi';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LayoutDashboard, ShoppingBag, Package, PlusCircle, ArrowRight, Trash2, Pencil, Activity, AlertCircle, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { ListingSkeleton, StatsSkeleton } from '@/components/ui/skeleton';

// Activity item date formatter
const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

function DashboardContent() {
    const router = useRouter();
    const { data: userData } = useGetMeQuery();
    const { data: listingsData, isLoading: listingsLoading } = useGetMyListingsQuery();
    const { data: sellerOrdersData, isLoading: sellerOrdersLoading } = useGetMySellerOrdersQuery();
    const { data: buyerOrdersData, isLoading: buyerOrdersLoading } = useGetMyBuyerOrdersQuery();
    const { data: activityData, isLoading: activityLoading } = useGetMyActivitiesQuery({ limit: 10 });
    
    const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const user = userData?.data;
    const listings = listingsData?.data?.listings || [];
    const sellerOrders = sellerOrdersData?.data?.orders || [];
    const buyerOrders = buyerOrdersData?.data?.orders || [];
    const activities = activityData?.data?.activities || [];

    // Redirect admins to admin dashboard
    useEffect(() => {
        if (userData?.data?.role === 'ADMIN') {
            router.push('/admin/dashboard');
        }
    }, [userData, router]);

    // Data Computation
    const {
        sellerRevenue,
        sellerPendingAction,
        sellerCompleted,
        activeListingsCount
    } = useMemo(() => {
        let rev = 0;
        let pending = 0;
        let completed = 0;
        
        sellerOrders.forEach(o => {
            if (o.status === 'COMPLETED') {
                rev += o.offerPrice || 0;
                completed++;
            }
            if (o.status === 'REQUESTED') {
                pending++;
            }
        });

        return {
            sellerRevenue: rev,
            sellerPendingAction: sellerOrders.filter(o => o.status === 'REQUESTED'),
            sellerCompleted: completed,
            activeListingsCount: listings.filter(l => l.status === 'ACTIVE').length
        };
    }, [sellerOrders, listings]);

    const {
        buyerSpent,
        buyerPendingAction,
        buyerCompleted
    } = useMemo(() => {
        let spent = 0;
        let pending = 0;
        let completed = 0;
        
        buyerOrders.forEach(o => {
            if (o.status === 'COMPLETED') {
                spent += o.offerPrice || 0;
                completed++;
            }
            if (o.status === 'REQUESTED' || o.status === 'ACCEPTED') {
                pending++;
            }
        });

        return {
            buyerSpent: spent,
            buyerPendingAction: buyerOrders.filter(o => o.status === 'REQUESTED' || o.status === 'ACCEPTED'),
            buyerCompleted: completed
        };
    }, [buyerOrders]);


    const confirmDelete = async () => {
        if (!listingToDelete) return;
        try {
            await deleteListing(listingToDelete).unwrap();
            toast.success('Listing deleted');
            setListingToDelete(null);
            // If they deleted the last listing, they might want to switch tabs, but we'll leave them on 'listings'
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            {/* Quick Actions Bar */}
            <div className="bg-slate-200/50 dark:bg-[#1c2012] border-b border-primary/10">
                <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">Command Center</h2>
                    <div className="flex w-full sm:w-auto gap-3">
                        {user?.role !== 'ADMIN' && (
                            <Link href="/listings/create" className="flex-1 sm:flex-none">
                                <Button size="sm" className="w-full bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold gap-2">
                                    <PlusCircle size={14} /> <span className="text-xs sm:text-sm">Create</span>
                                </Button>
                            </Link>
                        )}
                        <Link href="/listings" className="flex-1 sm:flex-none">
                            <Button size="sm" variant="outline" className="w-full border-primary/20 hover:border-primary text-slate-700 dark:text-slate-200 hover:bg-primary/20 transition-all font-bold gap-2">
                                <ShoppingBag size={14} /> <span className="text-xs sm:text-sm">Browse</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 relative z-10 flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 animate-fade-in-up stagger-2">
                    <TabsList className="bg-slate-200 dark:bg-[#252a1a] border border-primary/10 p-1 rounded-xl inline-flex mb-4">
                        <TabsTrigger
                            value="overview"
                            className="text-slate-600 dark:text-slate-400 data-[state=active]:bg-primary data-[state=active]:text-background-dark hover:text-slate-900 dark:hover:text-slate-200 rounded-lg px-6 py-2.5 text-sm font-bold transition-all"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="listings"
                            className="text-slate-600 dark:text-slate-400 data-[state=active]:bg-primary data-[state=active]:text-background-dark hover:text-slate-900 dark:hover:text-slate-200 rounded-lg px-6 py-2.5 text-sm font-bold transition-all"
                        >
                            My Listings ({listings.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {/* 3-Column Layout on Desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left/Middle Columns: Business Stats & Action Items */}
                            <div className="lg:col-span-2 space-y-8">
                                
                                {/* Seller Business Area */}
                                {user?.role !== 'ADMIN' && (
                                    <section>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Package className="text-primary" size={24} />
                                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style">My Selling Business</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                            <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center abstract-bg relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">Active Listings</span>
                                                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-nexa-style relative z-10">{activeListingsCount}</span>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center abstract-bg relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">Sales Completed</span>
                                                <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-nexa-style relative z-10">{sellerCompleted}</span>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center sm:col-span-2 abstract-bg relative overflow-hidden group border-l-4 border-l-primary">
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1 relative z-10">Total Revenue Evaluated</span>
                                                <span className="text-3xl font-black text-primary font-nexa-style relative z-10">${sellerRevenue.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Seller Action Required */}
                                        {sellerPendingAction.length > 0 && (
                                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-6">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-1">
                                                            <AlertCircle size={16} /> Action Required: {sellerPendingAction.length} Pending Order{sellerPendingAction.length > 1 ? 's' : ''}
                                                        </h4>
                                                        <p className="text-xs text-slate-400">You have purchase requests waiting for your response or a quote.</p>
                                                    </div>
                                                    <Link href="/dashboard/orders">
                                                        <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary hover:text-background-dark font-bold text-xs h-8">
                                                            View Orders
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                        <hr className="border-primary/10" />
                                    </section>
                                )}

                                {/* Buyer Purchases Area */}
                                <section>
                                    <div className="flex items-center gap-3 mb-4 mt-6">
                                        <ShoppingBag className="text-slate-500" size={24} />
                                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style">My Purchases</h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center abstract-bg">
                                            <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Active Requests</span>
                                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-nexa-style">{buyerPendingAction.length}</span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center abstract-bg">
                                            <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Items Bought</span>
                                            <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-nexa-style">{buyerCompleted}</span>
                                        </div>
                                        <div className="bg-slate-100 dark:bg-[#252a1a] border border-primary/10 p-4 rounded-xl flex flex-col justify-center sm:col-span-2 abstract-bg">
                                            <span className="text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Total Spent Evaluated</span>
                                            <span className="text-3xl font-black text-slate-500 font-nexa-style">${buyerSpent.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end">
                                        <Link href="/dashboard/my-orders">
                                            <Button variant="link" className="text-primary hover:text-primary/80 font-bold p-0 text-sm">
                                                View Purchase History <ArrowRight size={14} className="ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </section>
                                
                            </div>

                            {/* Right Column: Activity Feed */}
                            <div className="lg:col-span-1 border-l-0 lg:border-l border-primary/10 lg:pl-8 pt-8 lg:pt-0">
                                <div className="flex items-center gap-3 mb-6">
                                    <Activity className="text-primary" size={20} />
                                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-nexa-style">Recent Activity</h3>
                                </div>

                                {activityLoading ? (
                                    <div className="space-y-4">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="flex gap-4">
                                                <div className="w-2 h-2 mt-2 rounded-full bg-slate-800 animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse" />
                                                    <div className="h-3 bg-slate-800 rounded w-1/4 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : activities.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-200/20 dark:bg-[#252a1a]/40 rounded-xl border border-primary/5">
                                        <p className="text-slate-500 font-medium text-sm">No recent activity.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-primary/20 ml-2 space-y-6">
                                        {activities.map((activity, idx) => (
                                            <div key={activity.id} className="relative pl-6">
                                                {/* Timeline Dot */}
                                                <div className="absolute w-3 h-3 bg-background-dark border-2 border-primary rounded-full -left-[6.5px] top-1.5 shadow-[0_0_8px_rgba(211,235,148,0.5)]" />
                                                
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{activity.message}</p>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                                        <Clock size={10} /> {formatTimeAgo(activity.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="listings" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {/* Same Listings view as before but integrated cleanly */}
                        <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white font-nexa-style">My Listings</h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Manage all your active and draft listings</p>
                            </div>
                            {user?.role !== 'ADMIN' && (
                                <Link href="/listings/create">
                                    <Button className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold gap-2 rounded-lg px-6 h-10">
                                        <PlusCircle size={18} /> Create New Listing
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {listingsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ListingSkeleton />
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="min-h-[300px] flex flex-col items-center justify-center p-12 bg-slate-200/20 dark:bg-[#252a1a]/40 border border-primary/5 border-dashed rounded-2xl text-center">
                                <div className="p-4 bg-slate-200 dark:bg-background-dark rounded-full mb-6">
                                    <LayoutDashboard size={40} className="text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style mb-2">No listings found</h3>
                                <p className="text-slate-500 mt-1 mb-8 max-w-sm">Create your first marketplace listing to start offering services to your clients.</p>
                                <Link href="/listings/create">
                                    <Button variant="outline" className="border-primary/20 hover:border-primary text-slate-700 dark:text-slate-200 hover:bg-primary/20 transition-all font-bold h-12 px-8">Create Listing</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {listings.map((listing) => (
                                    <div key={listing.id} className="group flex flex-col bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 hover:border-primary/40 transition-all duration-300 abstract-bg">
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start gap-2 mb-4">
                                                <div className="flex-1">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest mb-2 ${listing.isBlocked
                                                        ? 'bg-red-500/20 text-red-500'
                                                        : listing.status === 'ACTIVE'
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                                        }`}>
                                                        {listing.isBlocked ? 'BLOCKED BY ADMIN' : listing.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-nexa-style group-hover:text-primary transition-colors line-clamp-2 mb-2">
                                                <Link href={`/listings/${listing.id}`}>
                                                    {listing.title}
                                                </Link>
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 min-h-[60px] mt-auto font-medium">
                                                {listing.description}
                                            </p>
                                        </div>
                                        
                                        <div className="border-t border-primary/5 p-6 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Pricing</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white font-nexa-style">
                                                    {listing.price ? `$${listing.price.toLocaleString()}` : <span className="text-primary text-lg">Quote</span>}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/listings/${listing.id}/edit`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-10 w-10 p-0 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setListingToDelete(listing.id);
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-background-light dark:bg-background-dark border-primary/10">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-slate-900 dark:text-white font-nexa-style text-xl">Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                                                This action cannot be undone. This will permanently remove the listing "{listing.title}" from the marketplace.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-slate-200 dark:bg-[#252a1a] text-slate-900 dark:text-white border-primary/10 hover:bg-slate-300 dark:hover:bg-primary/10 font-bold">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={confirmDelete}
                                                                className="bg-red-500 text-white hover:bg-red-600 border-0 font-bold"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
