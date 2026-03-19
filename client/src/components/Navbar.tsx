'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, LogOut, Menu, X } from 'lucide-react';
import { useGetMeQuery, useLogoutMutation } from '@/store/authApi';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavbarProps {
    searchQuery?: string;
    setSearchQuery?: (val: string) => void;
}

export function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: userData } = useGetMeQuery();
    const [logout] = useLogoutMutation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const user = userData?.data;

    const isListingsBrowser = pathname === '/listings';

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
        setIsMenuOpen(false);
    };

    const navLinks = [
        { name: 'Browse', href: '/listings' },
        { name: 'Dashboard', href: '/dashboard' },
        ...(user?.role !== 'ADMIN' ? [
            { name: 'Create Listing', href: '/listings/create' },
            { name: 'My Sales', href: '/dashboard/orders' },
            { name: 'My Orders', href: '/dashboard/my-orders' },
        ] : []),
    ];

    return (
        <>
            <header className="border-b border-primary/10 px-6 py-4 lg:px-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 z-50 animate-fade-in-up stagger-1 w-full">
                <div className="max-w-screen-2xl mx-auto flex w-full items-center justify-between">
                
                <div className="flex items-center gap-10">
                    <Link href="/listings" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                            <span className="font-bold text-lg leading-none">V</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-tight font-nexa-style select-none">
                            Verchool
                        </h2>
                    </Link>
                    
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.href}
                                href={link.href} 
                                className={`text-sm font-semibold transition-colors ${pathname === link.href ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-1 justify-end gap-3 sm:gap-6 items-center">
                    {/* Search Bar - Hidden on small mobile, grows on Tablet/Desktop */}
                    {isListingsBrowser && setSearchQuery && (
                        <div className="hidden lg:flex flex-1 max-w-md ml-4">
                            <div className="flex w-full items-stretch rounded-lg h-10 bg-slate-200 dark:bg-primary/5 border border-transparent focus-within:border-primary/30 transition-all">
                                <div className="text-slate-500 dark:text-primary/60 flex items-center justify-center pl-4">
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchQuery || ''}
                                    onChange={(e) => setSearchQuery?.(e.target.value)}
                                    className="form-input flex w-full min-w-0 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-500 dark:placeholder:text-primary/40 px-3 text-sm font-medium outline-none text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href={user ? "/dashboard" : "/login"} className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-200 dark:bg-primary/10 text-slate-700 dark:text-primary hover:bg-primary/20 transition-all">
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            {user && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>}
                        </Link>
                        
                        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-primary/10">
                            {user ? (
                                <>
                                    <div className="bg-primary/20 flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/20 text-primary font-bold text-xs sm:text-sm uppercase">
                                        {user.name.substring(0, 2)}
                                    </div>
                                    <div className="hidden lg:block">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user.name}</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-1 font-bold">{user.role}</p>
                                    </div>
                                    <button onClick={handleLogout} className="hidden lg:block text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="bg-primary/20 flex items-center justify-center rounded-full w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/20 text-primary font-bold text-xs sm:text-sm">
                                    U
                                </Link>
                            )}
                        </div>

                        {/* Hamburger Button - Now visible on lg (up to 1024px) */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

        </header>
        
        {/* Mobile Sidebar Menu (Drawer) - Now visible on lg (up to 1024px) */}
        {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-[100] animate-in fade-in duration-200">
                {/* Darker, higher-opacity backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
                
                {/* Solid, ultra-dark drawer background */}
                <div className="absolute top-0 right-0 h-full w-[300px] bg-background-dark border-l border-primary/20 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                    <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
                        <Link href="/listings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                                <span className="font-bold text-lg leading-none">V</span>
                            </div>
                            <span className="text-xl font-bold text-white font-nexa-style">Verchool</span>
                        </Link>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 py-10">
                        <nav className="flex flex-col gap-5">
                            {navLinks.map((link) => (
                                <Link 
                                    key={link.href}
                                    href={link.href} 
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
                                        pathname === link.href 
                                            ? 'bg-primary text-background-dark shadow-[0_0_20px_rgba(211,235,148,0.3)]' 
                                            : 'text-slate-400 hover:bg-white/5 hover:text-primary border border-white/5'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {user && (
                        <div className="p-8 mt-auto border-t border-white/5 bg-black/40">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-primary/20 flex items-center justify-center rounded-2xl w-14 h-14 border-2 border-primary/20 text-primary font-bold text-xl shadow-inner">
                                    {user.name.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-white text-lg truncate">{user.name}</p>
                                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold mt-1 opacity-70">{user.role}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                <LogOut size={20} /> Logout Account
                            </button>
                        </div>
                    )}
                    
                    {!user && (
                        <div className="p-8 mt-auto border-t border-white/5 bg-black/40">
                            <Link 
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center justify-center px-6 py-5 rounded-2xl bg-primary text-background-dark font-extrabold hover:shadow-[0_0_20px_rgba(211,235,148,0.4)] transition-all text-center"
                            >
                                Sign In to Platform
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
