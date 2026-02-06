'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMySellerOrdersQuery, useUpdateOrderStatusMutation, useProvideQuoteMutation } from '@/store/ordersApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Package, ArrowLeft, DollarSign } from 'lucide-react';
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

function SellerOrdersContent() {
    const { data, isLoading, error } = useGetMySellerOrdersQuery();
    const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
    const [provideQuote, { isLoading: providingQuote }] = useProvideQuoteMutation();
    const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});

    const orders = data?.data?.orders || [];

    const handleStatusUpdate = async (orderId: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
        try {
            await updateStatus({ id: orderId, status }).unwrap();
            toast.success(`Order ${status.toLowerCase()}`);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update order');
        }
    };

    const handleProvideQuote = async (orderId: string) => {
        const price = quotePrices[orderId];
        if (!price || parseFloat(price) <= 0) {
            toast.error('Please enter a valid price');
            return;
        }
        try {
            await provideQuote({ id: orderId, offerPrice: parseFloat(price) }).unwrap();
            toast.success('Quote sent successfully!');
            setQuotePrices(prev => ({ ...prev, [orderId]: '' }));
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to provide quote');
        }
    };



    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <header className="border-b border-zinc-700 bg-zinc-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-zinc-300 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">Received Orders</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 relative z-10">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
                            <Package size={32} className="text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No orders yet</h3>
                        <p className="text-zinc-300 mt-1 max-w-sm">When buyers purchase your listings, the orders will appear here for your review.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {orders.map((order) => (
                            <Card key={order.id} className="bg-zinc-800/40 border-zinc-700/80 backdrop-blur-sm overflow-hidden hover:border-zinc-600 transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-zinc-700/50 bg-zinc-800/20">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold text-white">{order.listing?.title || 'Unknown Listing'}</CardTitle>
                                        <CardDescription className="text-zinc-300 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-zinc-600" />
                                            From: <span className="text-zinc-200">{order.buyer?.name}</span>
                                            <span className="text-zinc-400 text-xs ml-1">({order.buyer?.email})</span>
                                        </CardDescription>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        order.status === 'ACCEPTED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {order.status}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-sm text-zinc-400 mb-1">Offer Price</p>
                                                    <p className="text-2xl font-bold text-white">
                                                        {order.offerPrice ? `$${order.offerPrice.toLocaleString()}` : (
                                                            <span className="text-zinc-500 text-lg">Awaiting Quote</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {order.message && (
                                                    <div className="max-w-md p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                                        <p className="text-sm text-zinc-300 italic">"{order.message}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Provide Quote Form - Only for quote requests without price */}
                                        {order.status === 'REQUESTED' && !order.offerPrice && (
                                            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                                                <p className="text-sm text-indigo-300 mb-3 font-medium flex items-center gap-2">
                                                    <DollarSign size={16} />
                                                    Provide a quote for this request
                                                </p>
                                                <div className="flex gap-3">
                                                    <div className="relative flex-1 max-w-xs">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Enter price"
                                                            value={quotePrices[order.id] || ''}
                                                            onChange={(e) => setQuotePrices(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                            className="pl-8 bg-zinc-900/50 border-zinc-700 text-white"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleProvideQuote(order.id)}
                                                        disabled={providingQuote}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                                                    >
                                                        {providingQuote ? 'Sending...' : 'Send Quote'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            {/* For FIXED listings: Seller can Accept/Reject */}
                                            {order.status === 'REQUESTED' && order.offerPrice && order.listing?.listingType === 'FIXED' && (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                disabled={updating}
                                                                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border-0"
                                                            >
                                                                Accept Order
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">Accept this order?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-zinc-400">
                                                                    This will confirm the order. Ensure you have the stock ready to ship.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                                                                    className="bg-indigo-600 text-white hover:bg-indigo-700 border-0"
                                                                >
                                                                    Confirm Accept
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                disabled={updating}
                                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-white">Reject this order?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-zinc-400">
                                                                    This action cannot be undone. The buyer will be notified that you cannot fulfill this request.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
                                                                    className="bg-red-600 text-white hover:bg-red-700 border-0"
                                                                >
                                                                    Confirm Reject
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}

                                            {/* For QUOTE listings: Show waiting message */}
                                            {order.status === 'REQUESTED' && order.offerPrice && order.listing?.listingType === 'QUOTE' && (
                                                <p className="text-sm text-amber-400">
                                                    ⏳ Waiting for buyer to accept your quote...
                                                </p>
                                            )}

                                            {order.status === 'ACCEPTED' && (
                                                <Button
                                                    onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                    disabled={updating}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 border-0"
                                                >
                                                    Mark as Complete
                                                </Button>
                                            )}

                                            {['COMPLETED', 'REJECTED'].includes(order.status) && (
                                                <span className="text-sm text-zinc-400 italic">No further actions available</span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SellerOrdersPage() {
    return (
        <ProtectedRoute>
            <SellerOrdersContent />
        </ProtectedRoute>
    );
}
