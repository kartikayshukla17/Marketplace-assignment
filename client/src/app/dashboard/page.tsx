'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetMeQuery, useLogoutMutation } from '@/store/authApi';
import { useGetMyListingsQuery, useDeleteListingMutation } from '@/store/listingsApi';
import { useGetMySellerOrdersQuery } from '@/store/ordersApi';
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
import { LogOut, LayoutDashboard, ShoppingBag, Package, PlusCircle, ArrowRight, Trash2, MoreVertical, Pencil } from 'lucide-react';

function DashboardContent() {
    const router = useRouter();
    const { data: userData } = useGetMeQuery();
    const { data: listingsData } = useGetMyListingsQuery();
    const { data: ordersData } = useGetMySellerOrdersQuery();
    const [logout] = useLogoutMutation();
    const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const user = userData?.data;
    const listings = listingsData?.data?.listings || [];
    const orders = ordersData?.data?.orders || [];
    const pendingOrders = orders.filter((o) => o.status === 'REQUESTED');

    // Redirect admins to admin dashboard
    useEffect(() => {
        if (userData?.data?.role === 'ADMIN') {
            router.push('/admin/dashboard');
        }
    }, [userData, router]);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        try {
            await deleteListing(listingToDelete).unwrap();
            toast.success('Listing deleted');
            setListingToDelete(null);
        } catch (error) {
            toast.error('Failed to delete listing');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <LayoutDashboard size={18} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Marketplace</h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 mx-6">
                        <Link href="/listings" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-white/5 px-3 py-2 rounded-lg">
                            Browse
                        </Link>
                        {user?.role !== 'ADMIN' && (
                            <>
                                <Link href="/listings/create" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-white/5 px-3 py-2 rounded-lg">
                                    Create Listing
                                </Link>
                                <Link href="/dashboard/orders" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-white/5 px-3 py-2 rounded-lg">
                                    My Sales
                                </Link>
                                <Link href="/dashboard/my-orders" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-white/5 px-3 py-2 rounded-lg">
                                    My Orders
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-6">
                        <span className="text-sm text-zinc-300 hidden md:inline-block">Welcome, <span className="text-zinc-100 font-medium">{user?.name}</span></span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-zinc-300 hover:text-white hover:bg-zinc-700 gap-2"
                        >
                            <LogOut size={16} />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 relative z-10">

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-zinc-800 border border-zinc-700 p-1 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white hover:text-zinc-200 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="listings"
                            className="text-zinc-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white hover:text-zinc-200 rounded-lg px-4 py-2 text-sm font-medium transition-all"
                        >
                            My Listings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Dashboard Overview</h2>
                            <p className="text-zinc-400">Welcome back. Here's what's happening with your business.</p>
                        </div>

                        {/* Hero Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Seller Action Card */}
                            {user?.role !== 'ADMIN' && (
                                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-zinc-900 border border-indigo-500/20 p-8 group transition-all hover:border-indigo-500/40">
                                    <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-300">
                                                <Package size={24} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">Seller Hub</h3>
                                        </div>
                                        <p className="text-zinc-400 mb-8 max-w-sm">Manage your inventory and start selling today.</p>

                                        <div className="grid gap-3">
                                            <Link href="/listings/create" className="w-full">
                                                <Button className="w-full bg-indigo-500/80 hover:bg-indigo-500 text-white h-12 text-base shadow-md shadow-indigo-500/10 justify-between px-6 border-0">
                                                    <span className="flex items-center gap-2 font-medium">Create New Listing</span>
                                                    <PlusCircle size={18} />
                                                </Button>
                                            </Link>
                                            <Link href="/dashboard/orders" className="w-full">
                                                <Button variant="outline" className="w-full bg-zinc-900/50 border-zinc-700 hover:border-indigo-500/50 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 h-12 justify-between px-6 backdrop-blur-sm">
                                                    View Received Orders
                                                    <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">{pendingOrders.length} New</span>
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buyer Action Card */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-zinc-900 border border-emerald-500/20 p-8 group transition-all hover:border-emerald-500/40">
                                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Buyer Hub</h3>
                                    </div>
                                    <p className="text-zinc-400 mb-8 max-w-sm">Explore specific services and track your orders.</p>

                                    <div className="grid gap-3">
                                        <Link href="/listings" className="w-full">
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base shadow-lg shadow-emerald-600/20 justify-between px-6 border-0">
                                                <span className="flex items-center gap-2 font-medium">Browse Marketplace</span>
                                                <ArrowRight size={18} />
                                            </Button>
                                        </Link>
                                        <Link href="/dashboard/my-orders" className="w-full">
                                            <Button variant="outline" className="w-full bg-zinc-900/50 border-zinc-700 hover:border-emerald-500/50 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 h-12 justify-between px-6 backdrop-blur-sm">
                                                My Purchase Requests
                                                <ArrowRight size={16} className="opacity-50" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Listings</span>
                                <span className="text-3xl font-bold text-white">{listings.length}</span>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Pending Orders</span>
                                <span className="text-3xl font-bold text-amber-500">{pendingOrders.length}</span>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                                <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-1">Total Orders</span>
                                <span className="text-3xl font-bold text-emerald-500">{orders.length}</span>
                            </div>
                        </div>

                        {/* Recent Listings Preview */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Recent Listings</h3>
                                <Button
                                    variant="link"
                                    className="text-indigo-400 hover:text-indigo-300 p-0"
                                    onClick={() => setActiveTab('listings')}
                                >
                                    View All
                                </Button>
                            </div>
                            {listings.length === 0 ? (
                                <div className="text-center py-8 bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                                    <p className="text-zinc-500 text-sm">No listings yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {listings.slice(0, 3).map((listing) => (
                                        <Link key={listing.id} href={`/listings/${listing.id}`} className="block group">
                                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all hover:bg-zinc-800/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${listing.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                                                        {listing.status}
                                                    </span>
                                                    <span className="text-zinc-500 text-xs">{new Date(listing.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">{listing.title}</h4>
                                                <p className="text-zinc-400 text-sm font-medium">
                                                    {listing.price ? `$${listing.price.toLocaleString()}` : <span className="text-indigo-400">Quote</span>}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="listings" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight mb-1">My Listings</h2>
                                <p className="text-zinc-400 text-sm">Manage all your active and draft listings</p>
                            </div>
                            {user?.role !== 'ADMIN' && (
                                <Link href="/listings/create">
                                    <Button className="bg-indigo-500/80 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/10 border-0 gap-2">
                                        <span className="flex items-center gap-2"><PlusCircle size={18} /> Create New Listing</span>
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {listings.length === 0 ? (
                            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 bg-zinc-800/20 border border-zinc-700/50 rounded-2xl">
                                <div className="p-4 bg-zinc-800 rounded-full mb-4">
                                    <LayoutDashboard size={32} className="text-zinc-500" />
                                </div>
                                <h3 className="text-lg font-medium text-white">No listings found</h3>
                                <p className="text-zinc-400 mt-1 mb-6">Create your first listing to start selling.</p>
                                <Link href="/listings/create">
                                    <Button variant="outline" className="border-zinc-600 text-zinc-300">Create Listing</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <Card
                                        key={listing.id}
                                        className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 h-full flex flex-col group"
                                    >
                                        <CardHeader className="pb-3 flex-1">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <div className="flex-1">
                                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${listing.isBlocked
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : listing.status === 'ACTIVE'
                                                            ? 'bg-emerald-500/10 text-emerald-400'
                                                            : 'bg-zinc-600/50 text-zinc-300'
                                                        }`}>
                                                        {listing.isBlocked ? 'BLOCKED BY ADMIN' : listing.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {/* Menu removed as per request */}
                                                </div>
                                            </div>
                                            <CardTitle className="text-lg font-medium text-zinc-50 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                                                <Link href={`/listings/${listing.id}`} className="hover:underline">
                                                    {listing.title}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription className="text-zinc-400 text-sm line-clamp-2 min-h-[40px]">
                                                {listing.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0 border-t border-zinc-700/50 p-4 bg-zinc-800/20">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-white">
                                                    {listing.price
                                                        ? `$${listing.price.toLocaleString()}`
                                                        : <span className="text-indigo-400 text-sm font-medium">Contact for Quote</span>
                                                    }
                                                </span>
                                                <div className="flex gap-2">
                                                    <Link href={`/listings/${listing.id}/edit`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-700 px-2"
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 px-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // prevent card click
                                                                    setListingToDelete(listing.id);
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-zinc-400">
                                                                    This action cannot be undone. This will permanently remove the listing "{listing.title}" from the marketplace.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={confirmDelete}
                                                                    className="bg-red-600 text-white hover:bg-red-700 border-0"
                                                                >
                                                                    Delete Listing
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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


