'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegisterMutation, useGetMeQuery } from '@/store/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [register, { isLoading }] = useRegisterMutation();
    const { data: userData, isLoading: isUserLoading } = useGetMeQuery();

    useEffect(() => {
        if (userData?.data) {
            router.push('/dashboard');
        }
    }, [userData, router]);

    const [formData, setFormData] = useState<RegisterInput>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    if (isUserLoading) {
        return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        try {
            // Validate with Zod
            const validatedData = registerSchema.parse(formData);

            // Send only required fields to API (not confirmPassword)
            await register({
                name: validatedData.name,
                email: validatedData.email,
                password: validatedData.password,
                role: isAdmin ? 'ADMIN' : 'USER',
            }).unwrap();
            toast.success('Account created! Welcome to Marketplace.');
            router.push('/dashboard');
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
                for (const issue of error.issues) {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0] as keyof RegisterInput] = issue.message;
                    }
                }
                setErrors(fieldErrors);
            } else if (error && typeof error === 'object' && 'data' in error) {
                const apiError = error as { data?: { message?: string } };
                toast.error(apiError.data?.message || 'Registration failed');
            } else {
                toast.error('Registration failed');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Card className="w-full max-w-md bg-zinc-800/40 border-zinc-700/80 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10">
                <CardHeader className="text-center pb-6 pt-8">
                    <div className="mx-auto mb-4 w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                        {/* Placeholder logo icon */}
                        <div className="w-6 h-6 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-zinc-300 mt-2">Join the B2B marketplace platform</CardDescription>
                </CardHeader>
                <CardContent className="pb-8 px-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-200 font-medium text-sm">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all duration-200"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-400 mt-1">{errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-200 font-medium text-sm">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 transition-all duration-200"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-200 font-medium text-sm">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 pr-10 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-zinc-200 font-medium text-sm">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl h-11 pr-10 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Admin Checkbox */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="admin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked: boolean | 'indeterminate') => setIsAdmin(checked === true)}
                                />
                                <Label
                                    htmlFor="admin"
                                    className="text-sm text-zinc-300 cursor-pointer select-none"
                                >
                                    Register as Administrator
                                </Label>
                            </div>
                            {isAdmin && (
                                <Alert className="bg-amber-500/10 border-amber-500/30">
                                    <AlertCircle className="h-4 w-4 text-amber-400" />
                                    <AlertDescription className="text-xs text-amber-200/90 ml-2">
                                        Admin accounts are view-only. You can view all users and orders,
                                        but cannot create listings, buy, or sell items.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl h-11 font-medium shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:shadow-indigo-500/30"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>
                    <p className="mt-6 text-center text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}



