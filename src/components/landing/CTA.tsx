"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    return (
        <section className="py-32 relative overflow-hidden flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-linear-to-b from-[#06070A] to-[#0A0B10] z-0" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center max-w-4xl px-6"
            >
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                    Ready to <span className="text-blue-500">outperform</span>?
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                    Join the elite traders using PolyGraalX. Set up your bot in 2 minutes via Telegram. No credit card required for basic tier.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="https://t.me/Plmktradingbot"
                        className="group px-8 py-5 bg-white text-black text-lg font-bold rounded-xl flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        Start Free on Telegram
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-8 py-5 text-slate-300 font-bold rounded-xl border border-white/10 hover:bg-white/5 transition"
                    >
                        View Live Demo
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
