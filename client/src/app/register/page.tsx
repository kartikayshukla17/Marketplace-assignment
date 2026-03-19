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
            if (userData.data.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/listings');
            }
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
        return <div className="min-h-screen bg-zinc-800 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>;
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
            
            if (isAdmin) {
                router.push('/admin/dashboard');
            } else {
                router.push('/listings');
            }
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
        <div className="min-h-screen flex flex-col md:flex-row bg-[#1c2012] text-slate-100 font-nexa-style relative overflow-hidden">
            {/* Left Column: Form */}
            <div className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] flex flex-col justify-between p-8 lg:p-12 z-10 bg-[#1c2012] relative h-screen overflow-y-auto">
                
                {/* Header / Logo */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-primary rounded shadow-[0_0_15px_rgba(211,235,148,0.4)] flex items-center justify-center text-[#1c2012]">
                        <span className="font-extrabold text-xl leading-none">V</span>
                    </div>
                    <span className="font-extrabold text-xl tracking-wide text-white">Verchool B2B</span>
                </div>

                {/* Main Form Area */}
                <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto pb-8">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-3">Create Account</h1>
                    <p className="text-slate-400 text-sm font-medium mb-8">Join the premier global B2B trading network.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 opacity-50">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </span>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-[#252a1a] border-primary/20 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-14 pl-12 transition-all duration-300 abstract-bg"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-red-500 mt-1 font-bold">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Email</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-serif italic text-lg opacity-50">@</span>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-[#252a1a] border-primary/20 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-14 pl-12 transition-all duration-300 abstract-bg"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1 font-bold">{errors.email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 opacity-50">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </span>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="bg-[#252a1a] border-primary/20 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-14 pl-12 pr-10 transition-all duration-300 abstract-bg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1 font-bold">{errors.password}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 opacity-50">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </span>
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="bg-[#252a1a] border-primary/20 text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl h-14 pl-12 pr-10 transition-all duration-300 abstract-bg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors p-1"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1 font-bold">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        {/* Admin Checkbox */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="admin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked: boolean | 'indeterminate') => setIsAdmin(checked === true)}
                                    className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-[#1c2012]"
                                />
                                <Label
                                    htmlFor="admin"
                                    className="text-xs font-bold text-slate-400 cursor-pointer select-none tracking-widest uppercase"
                                >
                                    Register as Administrator
                                </Label>
                            </div>
                            {isAdmin && (
                                <Alert className="bg-primary/10 border-primary/30 text-primary p-3">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs ml-2 font-medium">
                                        Admin accounts are view-only. You cannot create listings, buy, or sell items.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary text-[#1c2012] hover:bg-primary/90 h-14 text-base font-extrabold tracking-wide rounded-xl mt-4 transition-all hover:shadow-[0_0_20px_rgba(211,235,148,0.3)] flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Business Account'} 
                            {!isLoading && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
                        </Button>
                    </form>

                    <div className="mt-8 border-t border-primary/10 pt-6 text-center text-sm text-slate-400 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Footer Links (Mobile only, hidden on Desktop since it overflows) */}
                <div className="md:hidden mt-8 flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-bold tracking-widest uppercase gap-4 opacity-60">
                    <p>© 2026 VERCHOOL</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                    </div>
                </div>
            </div>

            {/* Right Column: Imagery & Testimonial */}
            <div className="hidden md:flex flex-1 relative bg-[#0a0c06] items-center justify-center p-12 overflow-hidden">
                {/* Background Image Overlay */}
                <div 
                    className="absolute inset-0 opacity-40 mix-blend-luminosity bg-cover bg-center"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' }}
                />
                
                {/* Gradient Masks */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1c2012] via-transparent to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c2012] via-transparent to-transparent opacity-60" />

                {/* Testimonial Card */}
                <div className="relative z-10 bg-[#1c2012]/80 backdrop-blur-md border border-primary/20 rounded-2xl p-10 max-w-lg shadow-2xl abstract-bg">
                    <div className="flex gap-1 mb-6 text-primary">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        ))}
                    </div>
                    
                    <p className="text-2xl text-white font-medium italic leading-relaxed mb-8">
                        "The most intuitive wholesale platform we've used in a decade. Real-time logistics and seamless payments transformed our supply chain."
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 text-primary">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div>
                            <h4 className="text-white font-extrabold text-base">Marcus Thorne</h4>
                            <p className="text-primary text-[10px] font-bold uppercase tracking-widest opacity-80">Director, GlobalOps</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



