'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetListingQuery, useDeleteListingMutation, useUpdateListingMutation } from '@/store/listingsApi';
import { useCreateOrderMutation } from '@/store/ordersApi';
import { useGetMeQuery } from '@/store/authApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2, User, Tag, DollarSign, Calendar, Pause, Play, ShoppingCart, FileText } from 'lucide-react';

export default function ListingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: userData } = useGetMeQuery();
    const { data, isLoading, error } = useGetListingQuery(id);
    const [deleteListing, { isLoading: isDeleting }] = useDeleteListingMutation();
    const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
    const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();

    const listing = data?.data?.listing;
    const user = userData?.data; // Extract user data for easier access
    const isOwner = user?.id === listing?.sellerId;
    const isLoggedIn = !!user?.id;

    const handlePurchaseRequest = async () => {
        if (!isLoggedIn) {
            toast.error('Please login to send a purchase request');
            router.push('/login');
            return;
        }

        try {
            await createOrder({ listingId: id }).unwrap();
            toast.success('Purchase request sent successfully!');
            router.push('/dashboard/my-orders');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to send purchase request');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

        try {
            await deleteListing(id).unwrap();
            toast.success('Listing deleted successfully');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete listing');
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = listing?.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        try {
            await updateListing({ id, data: { status: newStatus } }).unwrap();
            toast.success(`Listing ${newStatus === 'PAUSED' ? 'paused' : 'activated'} successfully`);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update listing status');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-xl font-bold mb-2">Listing Not Found</h2>
                <p className="text-zinc-300 mb-4">This listing may have been removed or doesn't exist.</p>
                <Link href="/listings">
                    <Button variant="outline" className="border-zinc-600 text-zinc-200 hover:text-white hover:bg-zinc-700 bg-transparent">
                        Back to Listings
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/listings" className="text-zinc-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Listing Details</h1>
                    </div>
                    {isOwner && (
                        <div className="flex gap-3">
                            {listing.status !== 'DRAFT' && (
                                <Button
                                    variant="outline"
                                    onClick={handleToggleStatus}
                                    disabled={isUpdating}
                                    className={`gap-2 bg-transparent ${listing.status === 'ACTIVE'
                                        ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                                        : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                                        }`}
                                >
                                    {listing.status === 'ACTIVE' ? (
                                        <><Pause size={16} /> Pause</>
                                    ) : (
                                        <><Play size={16} /> Resume</>
                                    )}
                                </Button>
                            )}
                            <Link href={`/listings/${id}/edit`}>
                                <Button variant="outline" className="border-zinc-600 text-zinc-200 hover:text-white hover:bg-zinc-700 bg-transparent gap-2">
                                    <Edit size={16} />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                            >
                                <Trash2 size={16} />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-10 relative z-10 max-w-3xl">
                <Card className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-700/50 bg-zinc-800/20">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-2xl font-bold text-white mb-2">{listing.title}</CardTitle>
                                <CardDescription className="text-zinc-300 flex items-center gap-4 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Tag size={14} />
                                        {listing.category?.name || 'Uncategorized'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </span>
                                </CardDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${listing.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                listing.status === 'DRAFT' ? 'bg-zinc-400/10 text-zinc-300 border-zinc-400/20' :
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                {listing.status}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {/* Price */}
                        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400">Price</p>
                                <p className="text-2xl font-bold text-white">
                                    {listing.price
                                        ? `$${listing.price.toLocaleString()} `
                                        : <span className="text-indigo-400">Contact for Quote</span>
                                    }
                                    {listing.price && <span className="text-sm text-zinc-400 font-normal">{listing.currency}</span>}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm text-zinc-400 mb-2">Description</h3>
                            <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                        </div>

                        {/* Seller Info */}
                        {listing.seller && (
                            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                                <div className="p-2 bg-zinc-700 rounded-lg text-zinc-300">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400">Seller</p>
                                    <p className="text-white font-medium">{listing.seller.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Actions for Non-Owners */}
                        {!isOwner && listing.status === 'ACTIVE' && user?.role !== 'ADMIN' && (
                            <div className="pt-4 border-t border-zinc-700">
                                {listing.listingType === 'FIXED' ? (
                                    <Button
                                        onClick={handlePurchaseRequest}
                                        disabled={isOrdering}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 shadow-lg shadow-indigo-600/20 border-0 gap-2"
                                    >
                                        <ShoppingCart size={18} />
                                        {isOrdering ? 'Sending Request...' : `Purchase - $${listing.price?.toLocaleString()}`}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePurchaseRequest}
                                        disabled={isOrdering}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-12 shadow-lg shadow-indigo-600/20 border-0 gap-2"
                                    >
                                        <FileText size={18} />
                                        {isOrdering ? 'Sending Request...' : 'Request Quote'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
