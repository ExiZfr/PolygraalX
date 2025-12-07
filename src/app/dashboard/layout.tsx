"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Radar, Users, Brain, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Radar", href: "/dashboard/radar", icon: Radar },
    { name: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
    { name: "Oracle", href: "/dashboard/oracle", icon: Brain },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                router.push('/login');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="flex h-screen bg-[#050505] text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-black/40 border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Poly<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">GraalX</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">v2.3</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <motion.button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${isActive
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-white/5">
                    <motion.button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </motion.button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
