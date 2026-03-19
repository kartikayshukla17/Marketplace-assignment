'use client';

import Link from 'next/link';
import { useGetMyBuyerOrdersQuery, useCancelOrderMutation, useUpdateOrderStatusMutation } from '@/store/ordersApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ShoppingBag, ArrowLeft, ExternalLink, X, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';

// ==========================================
// STATUS BADGE COMPONENT
// ==========================================
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        REQUESTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        ACCEPTED: 'bg-primary/20 text-primary border-primary/20',
        COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
        CANCELLED: 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700',
    };

    return (
        <div className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border ${styles[status] || styles.CANCELLED}`}>
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
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            <div className="border-b border-primary/5 bg-background-light/40 dark:bg-[#1c2012]/40 animate-fade-in-up stagger-1">
                <div className="container mx-auto px-6 py-6 flex flex-col gap-2 relative">
                    <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm font-bold w-fit uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">My Purchase Requests</h1>
                        <Link href="/listings">
                            <Button className="bg-primary/20 text-primary hover:bg-primary hover:text-background-dark font-bold font-nexa-style gap-2 hidden md:flex h-12 px-6">
                                Browse Listings
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10 relative z-10 flex-1 animate-fade-in-up stagger-2">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-200/20 dark:bg-[#252a1a]/40 rounded-2xl border border-primary/5 border-dashed">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-background-dark rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style mb-2">No purchase requests yet</h3>
                        <p className="text-slate-500 mt-1 max-w-sm font-medium">
                            When you send purchase requests to sellers, they will appear here.
                        </p>
                        <Link href="/listings" className="mt-8">
                            <Button className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold h-12 px-8">
                                Browse Listings
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 abstract-bg shadow-sm">
                                <CardHeader className="flex flex-row items-start justify-between pb-6 p-8 border-b border-primary/5">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style mb-2">
                                            {order.listing?.title || 'Unknown Listing'}
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            Seller: <span className="text-slate-700 dark:text-slate-300 normal-case tracking-normal">{order.seller?.name}</span>
                                        </CardDescription>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </CardHeader>

                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-10">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Order Price</p>
                                                <p className="text-4xl font-black text-slate-900 dark:text-white font-nexa-style">
                                                    ${order.offerPrice?.toLocaleString() || '0'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Requested</p>
                                                <p className="text-slate-900 dark:text-slate-200 font-bold">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status-specific messages and actions */}
                                        <div className="flex flex-col gap-3 flex-wrap">
                                            {/* QUOTE listing - Quote Received - Accept/Reject */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'QUOTE' && order.offerPrice && (
                                                <div className="bg-slate-200/50 dark:bg-background-dark border border-primary/20 rounded-xl p-5">
                                                    <p className="text-sm text-primary mb-4 font-bold flex items-center gap-2 uppercase tracking-widest">
                                                        ✨ Quote received! Review and decide:
                                                    </p>
                                                    <div className="flex gap-4">
                                                        <Button
                                                            onClick={() => handleAcceptQuote(order.id)}
                                                            disabled={updating}
                                                            className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold gap-2 px-6 h-12"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                            {updating ? 'Accepting...' : 'Accept Quote'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleRejectQuote(order.id)}
                                                            disabled={updating}
                                                            className="border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold gap-2 px-6 h-12 bg-transparent transition-colors"
                                                        >
                                                            <XCircle size={18} />
                                                            {updating ? 'Cancelling...' : 'Decline Quote'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* QUOTE listing - Waiting for seller to provide quote */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'QUOTE' && !order.offerPrice && (
                                                <div className="flex flex-col items-end gap-3">
                                                    <p className="text-sm text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-lg">⏳ Waiting for seller to provide a quote...</p>
                                                    <Button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={isCancelling}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 w-fit font-bold"
                                                    >
                                                        <X size={16} />
                                                        Cancel Request
                                                    </Button>
                                                </div>
                                            )}

                                            {/* FIXED listing - Waiting for seller to accept */}
                                            {order.status === 'REQUESTED' && order.listing?.listingType === 'FIXED' && (
                                                <div className="flex flex-col items-end gap-3">
                                                    <p className="text-sm text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-lg">⏳ Waiting for seller to accept your request...</p>
                                                    <Button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={isCancelling}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 w-fit font-bold"
                                                    >
                                                        <X size={16} />
                                                        Cancel Request
                                                    </Button>
                                                </div>
                                            )}
                                            {order.status === 'ACCEPTED' && (
                                                <p className="text-sm text-primary font-bold bg-primary/10 px-4 py-2 rounded-lg">✅ Seller accepted! Awaiting completion.</p>
                                            )}
                                            {order.status === 'COMPLETED' && (
                                                <p className="text-sm text-emerald-500 font-bold bg-emerald-500/10 px-4 py-2 rounded-lg">Order completed successfully!</p>
                                            )}
                                            {order.status === 'REJECTED' && (
                                                <p className="text-sm text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-lg">Seller declined this request.</p>
                                            )}

                                            {order.listing?.id && (
                                                <Link href={`/listings/${order.listing.id}`} className="block">
                                                    <Button
                                                        variant="outline"
                                                        className="border-primary/20 text-slate-700 dark:text-slate-200 hover:border-primary w-full md:w-auto h-12 bg-transparent font-bold transition-colors gap-2"
                                                    >
                                                        <ExternalLink size={16} />
                                                        View Listing
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order message if any */}
                                    {order.message && (
                                        <div className="mt-8 p-5 bg-slate-200/50 dark:bg-black/20 rounded-xl border border-primary/5">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium">"{order.message}"</p>
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
