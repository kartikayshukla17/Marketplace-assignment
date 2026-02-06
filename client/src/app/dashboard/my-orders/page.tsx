'use client';

import Link from 'next/link';
import { useGetMyBuyerOrdersQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from '@/store/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ShoppingBag, ArrowLeft, ExternalLink, X, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        REQUESTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        ACCEPTED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
        CANCELLED: 'bg-zinc-400/10 text-zinc-300 border-zinc-400/20',
    };

    return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.CANCELLED}`}>
            {status}
        </div>
    );
};

// ==========================================
// MAIN CONTENT
// ==========================================
function BuyerOrdersContent() {
    const { data, isLoading, error } = useGetMyBuyerOrdersQuery();
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
    const orders = data?.data?.orders || [];

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this purchase request?')) return;

        try {
            await cancelOrder(orderId).unwrap();
            toast.success('Order cancelled successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to cancel order');
        }
    };

    const handleAcceptQuote = async (orderId: string) => {
        try {
            await updateStatus({ id: orderId, status: 'ACCEPTED' }).unwrap();
            toast.success('Quote accepted! Proceed with payment.');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to accept quote');
        }
    };

    const handleRejectQuote = async (orderId: string) => {
        try {
            await updateStatus({ id: orderId, status: 'CANCELLED' }).unwrap();
            toast.success('Quote cancelled');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to cancel quote');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">My Purchase Requests</h1>
                    </div>
                    <Link href="/listings">
                        <Button variant="outline" className="border-zinc-600 text-zinc-200 hover:text-white hover:bg-zinc-700 bg-transparent gap-2">
                            Browse Listings
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8 relative z-10">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
                            <ShoppingBag size={32} className="text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No purchase requests yet</h3>
                        <p className="text-zinc-300 mt-1 max-w-sm">
                            When you send purchase requests to sellers, they will appear here.
                        </p>
                        <Link href="/listings" className="mt-6">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border-0">
                                Browse Listings
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm overflow-hidden hover:border-zinc-600 transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-zinc-700/50 bg-zinc-800/20">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-lg font-semibold text-white">
                                            {order.listing?.title || 'Unknown Listing'}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-300 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                            Seller: <span className="text-zinc-200">{order.seller?.name}</span>
                                        </CardDescription>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </CardHeader>

                                <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-sm text-zinc-400 mb-1">Order Price</p>
                                                <p className="text-2xl font-bold text-white">
                                                    ${order.offerPrice?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-400 mb-1">Requested</p>
                                                <p className="text-white">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status-specific messages and actions */}
                                        <div className="flex flex-col gap-3 flex-wrap">
                                            {/* QUOTE listing - Quote Received - Accept/Reject */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'QUOTE' && order.offerPrice && (
                                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                                                    <p className="text-sm text-indigo-300 mb-3 font-medium">
                                                        ✨ Quote received! Review and decide:
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <Button
                                                            onClick={() => handleAcceptQuote(order.id)}
                                                            disabled={updating}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                            {updating ? 'Accepting...' : 'Accept Quote'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleRejectQuote(order.id)}
                                                            disabled={updating}
                                                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent gap-2"
                                                        >
                                                            <XCircle size={18} />
                                                            {updating ? 'Cancelling...' : 'Decline Quote'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* QUOTE listing - Waiting for seller to provide quote */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'QUOTE' && !order.offerPrice && (
                                                <>
                                                    <p className="text-sm text-amber-400">⏳ Waiting for seller to provide a quote...</p>
                                                    <Button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={isCancelling}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-fit"
                                                    >
                                                        <X size={14} />
                                                        Cancel Request
                                                    </Button>
                                                </>
                                            )}

                                            {/* FIXED listing - Waiting for seller to accept */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'FIXED' && (
                                                <>
                                                    <p className="text-sm text-amber-400">⏳ Waiting for seller to accept your request...</p>
                                                    <Button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={isCancelling}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-fit"
                                                    >
                                                        <X size={14} />
                                                        Cancel Request
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === 'ACCEPTED' && (
                                                <p className="text-sm text-indigo-400">✅ Seller accepted! Awaiting completion.</p>
                                            )}
                                            {order.status === 'COMPLETED' && (
                                                <p className="text-sm text-emerald-400">Order completed successfully!</p>
                                            )}
                                            {order.status === 'REJECTED' && (
                                                <p className="text-sm text-red-400">Seller declined this request.</p>
                                            )}

                                            {order.listing?.id && (
                                                <Link href={`/listings/${order.listing.id}`}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1 border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700 bg-transparent"
                                                    >
                                                        <ExternalLink size={14} />
                                                        View Listing
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order message if any */}
                                    {order.message && (
                                        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                            <p className="text-sm text-zinc-300 italic">"{order.message}"</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

// ==========================================
// PAGE EXPORT
// ==========================================
export default function BuyerOrdersPage() {
    return (
        <ProtectedRoute>
            <BuyerOrdersContent />
        </ProtectedRoute>
    );
}
