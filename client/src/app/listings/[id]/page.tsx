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
import { Navbar } from '@/components/Navbar';

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
    const user = userData?.data; 
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
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center text-slate-900 dark:text-white">
                <h2 className="text-xl font-extrabold font-nexa-style mb-2">Listing Not Found</h2>
                <p className="text-slate-500 mb-4 font-medium">This listing may have been removed or doesn't exist.</p>
                <Link href="/listings">
                    <Button className="bg-primary/20 text-primary hover:bg-primary hover:text-background-dark transition-all font-bold font-nexa-style">
                        Back to Listings
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            {/* Listing Context Actions */}
            <div className="border-b border-primary/5 bg-background-light/40 dark:bg-[#1c2012]/40 animate-fade-in-up stagger-1">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <Link href="/listings" className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm font-bold w-fit uppercase tracking-widest">
                            <ArrowLeft size={16} /> Back to Listings
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">Listing Details</h1>
                    </div>
                    {isOwner && (
                        <div className="flex gap-3">
                            {listing.status !== 'DRAFT' && (
                                <Button
                                    onClick={handleToggleStatus}
                                    disabled={isUpdating}
                                    className={`font-bold gap-2 ${listing.status === 'ACTIVE'
                                        ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10 bg-transparent'
                                        : 'border-primary/50 text-primary hover:bg-primary/10 bg-transparent'
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
                                <Button variant="outline" className="border-primary/20 text-slate-700 dark:text-slate-200 hover:border-primary transition-colors gap-2 font-bold h-10 bg-transparent">
                                    <Edit size={16} />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-transparent text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 gap-2 font-bold h-10"
                            >
                                <Trash2 size={16} />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-10 relative z-10 max-w-3xl flex-1 animate-fade-in-up stagger-2">
                <Card className="bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 abstract-bg shadow-sm">
                    <CardHeader className="border-b border-primary/5 p-8 pb-6">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 line-clamp-2 font-nexa-style leading-tight">{listing.title}</CardTitle>
                                <CardDescription className="flex items-center gap-4 flex-wrap">
                                    <span className="flex items-center gap-2 font-bold bg-primary/10 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest text-primary">
                                        <Tag size={12} />
                                        {listing.category?.name || 'Uncategorized'}
                                    </span>
                                    <span className="flex items-center gap-2 font-bold bg-slate-200 dark:bg-black/20 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        <Calendar size={12} />
                                        {new Date(listing.createdAt).toLocaleDateString()}
                                    </span>
                                </CardDescription>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border ${listing.status === 'ACTIVE' ? 'bg-primary/10 text-primary border-primary/20' :
                                listing.status === 'DRAFT' ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700' :
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                {listing.status}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8 relative z-10">
                        {/* Price */}
                        <div className="flex items-center gap-4 p-5 bg-slate-200/50 dark:bg-black/20 rounded-xl border border-primary/5">
                            <div className="p-3 bg-primary/20 rounded-lg text-primary">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Price</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white font-nexa-style">
                                    {listing.price
                                        ? `$${listing.price.toLocaleString()} `
                                        : <span className="text-primary text-xl">Contact for Quote</span>
                                    }
                                    {listing.price && <span className="text-sm text-slate-500 font-bold ml-1 uppercase">{listing.currency}</span>}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm text-slate-900 dark:text-white font-extrabold mb-3 font-nexa-style">Description</h3>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{listing.description}</p>
                        </div>

                        {/* Seller Info */}
                        {listing.seller && (
                            <div className="flex items-center gap-4 p-5 bg-slate-200/50 dark:bg-black/20 rounded-xl border border-primary/5">
                                <div className="p-3 bg-slate-300 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Seller</p>
                                    <p className="text-slate-900 dark:text-white font-extrabold font-nexa-style text-lg">{listing.seller.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Actions for Non-Owners */}
                        {!isOwner && listing.status === 'ACTIVE' && user?.role !== 'ADMIN' && (
                            <div className="pt-8 border-t border-primary/10">
                                {listing.listingType === 'FIXED' ? (
                                    <Button
                                        onClick={handlePurchaseRequest}
                                        disabled={isOrdering}
                                        className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold w-full h-14 gap-3 text-lg rounded-xl"
                                    >
                                        <ShoppingCart size={20} />
                                        {isOrdering ? 'Sending Request...' : `Purchase - $${listing.price?.toLocaleString()}`}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handlePurchaseRequest}
                                        disabled={isOrdering}
                                        className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold w-full h-14 gap-3 text-lg rounded-xl"
                                    >
                                        <FileText size={20} />
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
