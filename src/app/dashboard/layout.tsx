"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Radar,
    Users,
    Brain,
    Settings,
    Menu,
    Bell,
    LogOut,
    Zap,
    ChevronRight,
    Receipt,
    Radio
} from "lucide-react";
import { RadarProvider } from "@/lib/radar-context";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
};

const navItems: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Market Radar", href: "/dashboard/radar", icon: Radar, badge: "Live" },
    { label: "Listener", href: "/dashboard/listener", icon: Radio },
    { label: "Orders", href: "/dashboard/orders", icon: Receipt },
    { label: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
    { label: "Oracle", href: "/dashboard/oracle", icon: Brain },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <RadarProvider>
            <div className="min-h-screen bg-[#06070A] text-white flex overflow-hidden font-sans selection:bg-indigo-500/30">
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <motion.aside
                    className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0A0B10] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                        }`}
                >
                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-white/5">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                                <Zap size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Poly<span className="text-indigo-400">GraalX</span>
                            </span>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-white transition-colors"} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 rounded-full animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && <ChevronRight size={16} className="text-indigo-400" />}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile / Bottom Actions */}
                    <div className="p-4 border-t border-white/5 bg-[#0C0D12]">
                        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold">
                                    JD
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-white truncate">John Doe</div>
                                    <div className="text-xs text-slate-400 truncate">Pro Plan</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 bg-black/20 rounded-lg p-2">
                                <span>Balance</span>
                                <span className="font-mono text-green-400">$12,450.00</span>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#06070A] relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                    </div>

                    {/* Header */}
                    <header className="h-20 flex items-center justify-between px-6 border-b border-white/5 bg-[#06070A]/80 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-white hidden sm:block">
                                    {navItems.find(i => i.href === pathname)?.label || "Dashboard"}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Status Indicator */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-medium text-green-400">System Online</span>
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#06070A]"></span>
                            </button>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </RadarProvider >
    );
}
