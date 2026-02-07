'use client';

import { useState, useEffect } from 'react';
import { useGetAllUsersQuery, useGetAllOrdersQuery, useGetAllListingsQuery, useToggleBlockUserMutation, useToggleBlockListingMutation } from '@/store/adminApi';
import { useGetMeQuery, useLogoutMutation } from '@/store/authApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Users, ShoppingBag, Shield, Package, Lock, Unlock, Search as SearchIcon, LogOut, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
    const router = useRouter();
    const { data: userData, isLoading: userLoading } = useGetMeQuery();
    const [logout] = useLogoutMutation();
    const [usersPage, setUsersPage] = useState(1);
    const [usersSearch, setUsersSearch] = useState('');
    const debouncedUsersSearch = useDebounce(usersSearch, 500);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [ordersPage, setOrdersPage] = useState(1);

    // Reset page when search changes
    useEffect(() => {
        setUsersPage(1);
    }, [debouncedUsersSearch]);

    const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery({
        page: usersPage,
        limit: 20,
        search: debouncedUsersSearch
    });

    // Redirect if not admin (using useEffect to avoid setState during render)
    useEffect(() => {
        if (userData?.data && userData.data.role !== 'ADMIN') {
            router.push('/dashboard');
        }
    }, [userData, router]);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
    };

    // Show loading state
    if (userLoading || !userData?.data) {
        return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><p className="text-white">Loading...</p></div>;
    }

    // Don't render if not admin (after redirect is triggered)
    if (userData.data.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-indigo-400" size={32} />
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        </div>
                        <p className="text-zinc-400">View and manage all users and orders</p>
                    </div>
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

                {/* Tabs */}
                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="bg-zinc-800 border-zinc-700">
                        <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white hover:text-white transition-all">
                            <Users size={18} className="mr-2" />
                            Users
                        </TabsTrigger>
                        <TabsTrigger value="listings" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white hover:text-white transition-all">
                            <Package size={18} className="mr-2" />
                            Listings
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white hover:text-white transition-all">
                            <ShoppingBag size={18} className="mr-2" />
                            Orders
                        </TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-4">
                        <Card className="bg-zinc-800 border-zinc-700">
                            <CardHeader>
                                <CardTitle className="text-white">All Users</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Total: {usersData?.pagination.total || 0} users
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                    <Input
                                        placeholder="Search users by name or email..."
                                        value={usersSearch}
                                        onChange={(e) => setUsersSearch(e.target.value)}
                                        className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50"
                                    />
                                </div>
                                {usersLoading ? (
                                    <TableSkeleton rows={10} />
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-700 text-left">
                                                        <th className="pb-3 text-zinc-300 font-medium">Name</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Email</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Role</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Listings</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Orders (Buyer)</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Orders (Seller)</th>
                                                        <th className="pb-3 text-zinc-300 font-medium">Joined</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {usersData?.users.map((user) => (
                                                        <UserRow key={user.id} user={user} onViewDetails={() => setSelectedUser(user)} />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {usersData && usersData.pagination.totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-6">
                                                <p className="text-sm text-zinc-400">
                                                    Page {usersData.pagination.page} of {usersData.pagination.totalPages}
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                                                        disabled={usersData.pagination.page === 1}
                                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                                    >
                                                        <ChevronLeft size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setUsersPage(p => p + 1)}
                                                        disabled={usersData.pagination.page >= usersData.pagination.totalPages}
                                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Listings Tab */}
                    <TabsContent value="listings" className="space-y-4">
                        <ListingsTabContent />
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-4">
                        <OrdersTabContent />
                    </TabsContent>
                </Tabs>

                {/* User Details Modal */}
                {selectedUser && (
                    <UserDetailsDialog
                        user={selectedUser}
                        open={!!selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
            </div>
        </div>
    );
}

function UserRow({ user, onViewDetails }: { user: any; onViewDetails: () => void }) {
    const [toggleBlock, { isLoading }] = useToggleBlockUserMutation();
    const isAdmin = user.role === 'ADMIN';

    const handleToggleBlock = async () => {
        if (confirm(`Are you sure you want to ${user.isBlocked ? 'unblock' : 'block'} this user?`)) {
            try {
                await toggleBlock(user.id).unwrap();
            } catch (error) {
                console.error('Failed to toggle block status:', error);
                alert('Failed to update user status');
            }
        }
    };

    return (
        <tr
            className={`border-b border-zinc-700/50 ${!isAdmin ? 'hover:bg-zinc-800/50 cursor-pointer' : ''} ${user.isBlocked ? 'bg-red-500/5' : ''}`}
            onClick={!isAdmin ? onViewDetails : undefined}
        >
            <td className="py-3 text-white">
                <div className="flex items-center gap-2">
                    {user.name}
                    {user.isBlocked && <Lock size={14} className="text-red-400" />}
                </div>
            </td>
            <td className="py-3 text-zinc-400">{user.email}</td>
            <td className="py-3">
                <span className={`px-2 py-1 rounded text-xs ${isAdmin ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-700 text-zinc-300'}`}>
                    {user.role}
                </span>
            </td>
            <td className="py-3 text-zinc-300">{user._count.listings}</td>
            <td className="py-3 text-zinc-300">{user._count.ordersAsBuyer}</td>
            <td className="py-3 text-zinc-300">{user._count.ordersAsSeller}</td>
            <td className="py-3 text-zinc-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                    {!isAdmin && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewDetails}
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </Button>
                    )}
                    {!isAdmin && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleBlock}
                            disabled={isLoading}
                            className={user.isBlocked ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" : "text-red-400 hover:text-red-300 hover:bg-red-500/10"}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                            {isLoading ? (
                                <span className="animate-spin">...</span>
                            ) : user.isBlocked ? (
                                <Unlock size={16} />
                            ) : (
                                <Lock size={16} />
                            )}
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

// User Details Dialog with Tabs for Listings and Orders
function UserDetailsDialog({ user, open, onClose }: { user: any; open: boolean; onClose: () => void }) {
    const [activeTab, setActiveTab] = useState('listings');
    const { data: listingsData, isLoading: listingsLoading } = useGetAllListingsQuery({ page: 1, limit: 100 });
    const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({ page: 1, limit: 100 });

    // Filter listings and orders for this user
    const userListings = listingsData?.listings.filter(l => l.seller.id === user.id) || [];
    const userOrdersAsBuyer = ordersData?.orders.filter(o => o.buyer.id === user.id) || [];
    const userOrdersAsSeller = ordersData?.orders.filter(o => o.seller.id === user.id) || [];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-800 border-zinc-700 text-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Users size={20} className="text-indigo-400" />
                        {user.name}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {user.email} • {user.role} • Joined {new Date(user.createdAt).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="bg-zinc-900 border-zinc-700">
                        <TabsTrigger value="listings" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white">
                            <Package size={16} className="mr-2" />
                            Listings ({userListings.length})
                        </TabsTrigger>
                        <TabsTrigger value="buyer-orders" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white">
                            <ShoppingBag size={16} className="mr-2" />
                            Orders as Buyer ({userOrdersAsBuyer.length})
                        </TabsTrigger>
                        <TabsTrigger value="seller-orders" className="data-[state=active]:bg-indigo-600 text-zinc-400 data-[state=active]:text-white">
                            <ShoppingBag size={16} className="mr-2" />
                            Orders as Seller ({userOrdersAsSeller.length})
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4">
                        <TabsContent value="listings" className="m-0">
                            {listingsLoading ? (
                                <p className="text-zinc-400 text-center py-8">Loading...</p>
                            ) : userListings.length === 0 ? (
                                <p className="text-zinc-400 text-center py-8">No listings found</p>
                            ) : (
                                <div className="space-y-2">
                                    {userListings.map((listing) => (
                                        <div key={listing.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-white">{listing.title}</h4>
                                                    <p className="text-sm text-zinc-400">
                                                        {listing.category?.name || 'Uncategorized'} • {listing.listingType}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {listing.isDeleted ? (
                                                        <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 font-medium border border-red-500/20">
                                                            DELETED
                                                        </span>
                                                    ) : listing.isBlocked ? (
                                                        <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 font-medium border border-red-500/20">
                                                            BLOCKED
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded text-xs ${listing.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : listing.status === 'DRAFT' ? 'bg-zinc-700 text-zinc-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                            {listing.status}
                                                        </span>
                                                    )}
                                                    <p className="text-sm text-zinc-300 mt-1">
                                                        {listing.price ? `$${listing.price}` : 'Quote'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="buyer-orders" className="m-0">
                            {ordersLoading ? (
                                <p className="text-zinc-400 text-center py-8">Loading...</p>
                            ) : userOrdersAsBuyer.length === 0 ? (
                                <p className="text-zinc-400 text-center py-8">No orders as buyer</p>
                            ) : (
                                <div className="space-y-2">
                                    {userOrdersAsBuyer.map((order) => (
                                        <div key={order.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-white">{order.listing.title}</h4>
                                                    <p className="text-sm text-zinc-400">
                                                        From: {order.seller.name} • {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    order.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-300' :
                                                        order.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                                                            'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="seller-orders" className="m-0">
                            {ordersLoading ? (
                                <p className="text-zinc-400 text-center py-8">Loading...</p>
                            ) : userOrdersAsSeller.length === 0 ? (
                                <p className="text-zinc-400 text-center py-8">No orders as seller</p>
                            ) : (
                                <div className="space-y-2">
                                    {userOrdersAsSeller.map((order) => (
                                        <div key={order.id} className="p-3 bg-zinc-900 rounded-lg border border-zinc-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-white">{order.listing.title}</h4>
                                                    <p className="text-sm text-zinc-400">
                                                        Buyer: {order.buyer.name} • {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    order.status === 'ACCEPTED' ? 'bg-blue-500/20 text-blue-300' :
                                                        order.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                                                            'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function ListingsTabContent() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data: listingsData, isLoading } = useGetAllListingsQuery({
        page,
        limit: 20,
        search: debouncedSearch
    });

    const [toggleBlockListing] = useToggleBlockListingMutation();

    const handleToggleBlock = async (listingId: string, isCurrentlyBlocked: boolean) => {
        try {
            await toggleBlockListing(listingId).unwrap();
            toast.success(isCurrentlyBlocked ? 'Listing unblocked' : 'Listing blocked');
        } catch (error) {
            toast.error('Failed to toggle listing block status');
        }
    };

    return (
        <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
                <CardTitle className="text-white">All Listings</CardTitle>
                <CardDescription className="text-zinc-400">
                    Total: {listingsData?.pagination.total || 0} listings
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search listings by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50"
                    />
                </div>
                {isLoading ? (
                    <p className="text-zinc-400">Loading listings...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-700 text-left">
                                        <th className="pb-3 text-zinc-300 font-medium">Title</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Type</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Category</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Seller</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Price</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Status</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Created</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listingsData?.listings.map((listing) => (
                                        <tr key={listing.id} className="border-b border-zinc-700/50">
                                            <td className="py-3 text-white max-w-[200px] truncate" title={listing.title}>{listing.title}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${listing.listingType === 'QUOTE' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                    {listing.listingType}
                                                </span>
                                            </td>
                                            <td className="py-3 text-zinc-400">{listing.category?.name || 'Uncategorized'}</td>
                                            <td className="py-3 text-zinc-400">{listing.seller.name}</td>
                                            <td className="py-3 text-zinc-300">
                                                {listing.price ? `$${listing.price.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="py-3">
                                                {listing.isDeleted ? (
                                                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 font-medium border border-red-500/20">
                                                        DELETED
                                                    </span>
                                                ) : listing.isBlocked ? (
                                                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-300 font-medium border border-red-500/20">
                                                        BLOCKED
                                                    </span>
                                                ) : (
                                                    <span className={`px-2 py-1 rounded text-xs ${listing.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' :
                                                        listing.status === 'DRAFT' ? 'bg-zinc-500/20 text-zinc-300' :
                                                            'bg-amber-500/20 text-amber-300'
                                                        }`}>
                                                        {listing.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-zinc-400 text-sm">
                                                {new Date(listing.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3">
                                                {!listing.isDeleted && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleBlock(listing.id, listing.isBlocked)}
                                                        className={listing.isBlocked
                                                            ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        }
                                                        title={listing.isBlocked ? 'Unblock listing' : 'Block listing'}
                                                    >
                                                        {listing.isBlocked ? (
                                                            <Unlock size={16} />
                                                        ) : (
                                                            <Lock size={16} />
                                                        )}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {listingsData && listingsData.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-zinc-400">
                                    Page {page} of {listingsData.pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= listingsData.pagination.totalPages}
                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function OrdersTabContent() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({
        page,
        limit: 20,
        search: debouncedSearch
    });

    return (
        <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
                <CardTitle className="text-white">All Orders</CardTitle>
                <CardDescription className="text-zinc-400">
                    Total: {ordersData?.pagination.total || 0} orders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <Input
                        placeholder="Search orders by buyer, seller, or listing..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50"
                    />
                </div>
                {ordersLoading ? (
                    <p className="text-zinc-400">Loading orders...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-700 text-left">
                                        <th className="pb-3 text-zinc-300 font-medium">Listing</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Type</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Buyer</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Seller</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Price</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Status</th>
                                        <th className="pb-3 text-zinc-300 font-medium">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ordersData?.orders.map((order) => (
                                        <tr key={order.id} className="border-b border-zinc-700/50">
                                            <td className="py-3 text-white">{order.listing.title}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${order.listing.listingType === 'QUOTE' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                                    {order.listing.listingType}
                                                </span>
                                            </td>
                                            <td className="py-3 text-zinc-400">{order.buyer.name}</td>
                                            <td className="py-3 text-zinc-400">{order.seller.name}</td>
                                            <td className="py-3 text-zinc-300">
                                                {order.offerPrice ? `$${order.offerPrice.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    order.status === 'ACCEPTED' ? 'bg-indigo-500/20 text-indigo-300' :
                                                        order.status === 'REJECTED' ? 'bg-red-500/20 text-red-300' :
                                                            order.status === 'CANCELLED' ? 'bg-zinc-500/20 text-zinc-300' :
                                                                'bg-amber-500/20 text-amber-300'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-zinc-400 text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {ordersData && ordersData.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-zinc-400">
                                    Page {page} of {ordersData.pagination.totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= ordersData.pagination.totalPages}
                                        className="bg-zinc-700 border-zinc-600 text-white hover:bg-zinc-600"
                                    >
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
