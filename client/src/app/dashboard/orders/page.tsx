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
import { Navbar } from '@/components/Navbar';
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

    if (isLoading) return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative z-10 layout-container flex grow flex-col">
            <Navbar />

            <div className="border-b border-primary/5 bg-background-light/40 dark:bg-[#1c2012]/40 animate-fade-in-up stagger-1">
                <div className="container mx-auto px-6 py-6 flex flex-col gap-2">
                    <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-2 text-sm font-bold w-fit uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-nexa-style">Received Orders</h1>
                </div>
            </div>

            <main className="container mx-auto px-6 py-10 relative z-10 flex-1 animate-fade-in-up stagger-2">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-200/20 dark:bg-[#252a1a]/40 rounded-2xl border border-primary/5 border-dashed">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-background-dark rounded-full flex items-center justify-center mb-6">
                            <Package size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style mb-2">No orders yet</h3>
                        <p className="text-slate-500 mt-1 max-w-sm font-medium">When buyers purchase your listings, the orders will appear here for your review.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="bg-slate-100 dark:bg-[#252a1a] rounded-xl overflow-hidden border border-primary/10 abstract-bg shadow-sm">
                                <CardHeader className="flex flex-row items-start justify-between pb-6 p-8 border-b border-primary/5">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-extrabold text-slate-900 dark:text-white font-nexa-style mb-2">{order.listing?.title || 'Unknown Listing'}</CardTitle>
                                        <CardDescription className="text-slate-500 flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            From: <span className="text-slate-700 dark:text-slate-300">{order.buyer?.name}</span>
                                            <span className="text-slate-400 normal-case tracking-normal ml-1">({order.buyer?.email})</span>
                                        </CardDescription>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.status === 'REQUESTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        order.status === 'ACCEPTED' ? 'bg-primary/20 text-primary border-primary/20' :
                                            order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                        {order.status}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Offer Price</p>
                                                <p className="text-4xl font-black text-slate-900 dark:text-white font-nexa-style">
                                                    {order.offerPrice ? `$${order.offerPrice.toLocaleString()}` : (
                                                        <span className="text-primary text-xl">Awaiting Quote</span>
                                                    )}
                                                </p>
                                            </div>
                                            {order.message && (
                                                <div className="flex-1 p-5 bg-slate-200/50 dark:bg-black/20 rounded-xl border border-primary/5">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium">"{order.message}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Provide Quote Form */}
                                        {order.status === 'REQUESTED' && !order.offerPrice && (
                                            <div className="bg-slate-200/50 dark:bg-background-dark border border-primary/20 rounded-xl p-6">
                                                <p className="text-sm text-primary mb-4 font-bold flex items-center gap-2 uppercase tracking-widest">
                                                    <DollarSign size={16} />
                                                    Provide a quote for this request
                                                </p>
                                                <div className="flex gap-4">
                                                    <div className="relative flex-1 max-w-xs">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="Enter price"
                                                            value={quotePrices[order.id] || ''}
                                                            onChange={(e) => setQuotePrices(prev => ({ ...prev, [order.id]: e.target.value }))}
                                                            className="pl-8 bg-slate-100 dark:bg-[#252a1a] border-primary/20 text-slate-900 dark:text-white focus-visible:ring-primary h-12 font-bold"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleProvideQuote(order.id)}
                                                        disabled={providingQuote}
                                                        className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold h-12 px-8"
                                                    >
                                                        {providingQuote ? 'Sending...' : 'Send Quote'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-4 border-t border-primary/5">
                                            {/* For FIXED listings: Seller can Accept/Reject */}
                                            {order.status === 'REQUESTED' && order.offerPrice && order.listing?.listingType === 'FIXED' && (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                disabled={updating}
                                                                className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold h-12 px-8"
                                                            >
                                                                Accept Order
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-background-light dark:bg-background-dark border-primary/10">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-slate-900 dark:text-white font-nexa-style text-xl">Accept this order?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                                                    This will confirm the order. Ensure you have the stock ready to ship.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-slate-200 dark:bg-[#252a1a] text-slate-900 dark:text-white border-primary/10 hover:bg-slate-300 dark:hover:bg-primary/10 font-bold">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                                                                    className="bg-primary text-background-dark hover:bg-primary/80 border-0 font-bold"
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
                                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold h-12 px-6"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-background-light dark:bg-background-dark border-primary/10">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-slate-900 dark:text-white font-nexa-style text-xl">Reject this order?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
                                                                    This action cannot be undone. The buyer will be notified that you cannot fulfill this request.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="bg-slate-200 dark:bg-[#252a1a] text-slate-900 dark:text-white border-primary/10 hover:bg-slate-300 dark:hover:bg-primary/10 font-bold">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleStatusUpdate(order.id, 'REJECTED')}
                                                                    className="bg-red-500 hover:bg-red-600 text-white border-0 font-bold"
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
                                                <p className="text-sm text-amber-500 font-bold bg-amber-500/10 px-4 py-2 rounded-lg">
                                                    ⏳ Waiting for buyer to accept your quote...
                                                </p>
                                            )}

                                            {order.status === 'ACCEPTED' && (
                                                <Button
                                                    onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                    disabled={updating}
                                                    className="bg-primary text-background-dark hover:shadow-[0_0_15px_rgba(211,235,148,0.4)] transition-all font-bold h-12 px-8"
                                                >
                                                    Mark as Complete
                                                </Button>
                                            )}

                                            {['COMPLETED', 'REJECTED'].includes(order.status) && (
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-200 dark:bg-black/20 px-4 py-2 rounded-lg flex items-center">
                                                    No further actions available
                                                </span>
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
