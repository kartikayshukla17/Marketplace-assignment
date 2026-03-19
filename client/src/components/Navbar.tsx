'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, LogOut } from 'lucide-react';
import { useGetMeQuery, useLogoutMutation } from '@/store/authApi';
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
    const user = userData?.data;

    const isListingsBrowser = pathname === '/listings';

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out');
        router.push('/login');
    };

    return (
        <header className="border-b border-primary/10 px-6 py-4 lg:px-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md sticky top-0 z-50 animate-fade-in-up stagger-1 w-full">
            <div className="max-w-screen-2xl mx-auto flex w-full items-center justify-between">
                
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                            <span className="font-bold text-lg leading-none">V</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-tight font-nexa-style select-none">
                            Verchool
                        </h2>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/listings" className={`text-sm font-semibold transition-colors ${pathname === '/listings' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>
                            Browse
                        </Link>
                        <Link href="/dashboard" className={`text-sm font-semibold transition-colors ${pathname === '/dashboard' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>
                            Dashboard
                        </Link>
                        {user?.role !== 'ADMIN' && (
                            <>
                                <Link href="/listings/create" className={`text-sm font-semibold transition-colors ${pathname === '/listings/create' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>
                                    Create Listing
                                </Link>
                                <Link href="/dashboard/orders" className={`text-sm font-semibold transition-colors ${pathname === '/dashboard/orders' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>
                                    My Sales
                                </Link>
                                <Link href="/dashboard/my-orders" className={`text-sm font-semibold transition-colors ${pathname === '/dashboard/my-orders' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary'}`}>
                                    My Orders
                                </Link>
                            </>
                        )}
                    </nav>
                </div>

                <div className="flex flex-1 justify-end gap-6 items-center">
                    {/* Render search ONLY if we are on the browse tab AND the parent controls it */}
                    {isListingsBrowser && setSearchQuery && (
                        <label className="hidden lg:flex flex-col min-w-40 h-10 max-w-md w-full ml-4">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-slate-200 dark:bg-primary/5 border border-transparent focus-within:border-primary/30 transition-all">
                                <div className="text-slate-500 dark:text-primary/60 flex items-center justify-center pl-4">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for B2B services..."
                                    value={searchQuery || ''}
                                    onChange={(e) => setSearchQuery?.(e.target.value)}
                                    className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-slate-500 dark:placeholder:text-primary/40 px-4 text-sm font-medium outline-none text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </label>
                    )}

                    <div className="flex items-center gap-4">
                        <Link href={user ? "/dashboard" : "/login"} className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-primary/10 text-slate-700 dark:text-primary hover:bg-primary/20 transition-all">
                            <Bell className="w-5 h-5" />
                            {user && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>}
                        </Link>
                        
                        <div className="flex items-center gap-3 pl-2 border-l border-primary/10">
                            {user ? (
                                <>
                                    <div className="bg-primary/20 flex items-center justify-center rounded-full w-10 h-10 border-2 border-primary/20 text-primary font-bold uppercase transition-all">
                                        {user.name.substring(0, 2)}
                                    </div>
                                    <div className="hidden lg:block">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mt-1 font-bold">{user.role}</p>
                                    </div>
                                    <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="bg-primary/20 flex items-center justify-center rounded-full w-10 h-10 border-2 border-primary/20 text-primary font-bold">
                                        U
                                    </Link>
                                    <div className="hidden lg:block">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Guest User</p>
                                        <Link href="/login" className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-primary transition-colors font-bold mt-1 inline-block">Sign In</Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
