"use client";

import Link from "next/link";
import { Github, Twitter, Send } from "lucide-react";

export default function Footer() {
    return (
        <footer className="py-12 border-t border-white/5 bg-[#050608]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 p-[1px]">
                        <div className="w-full h-full bg-black rounded-lg" />
                    </div>
                    <span className="font-bold text-white">PolyGraalX</span>
                </div>

                <div className="text-slate-500 text-sm">
                    © 2025 PolyGraalX. Built for the prediction economy.
                </div>

                <div className="flex items-center gap-6">
                    <Link href="#" className="text-slate-500 hover:text-white transition"><Twitter size={20} /></Link>
                    <Link href="#" className="text-slate-500 hover:text-white transition"><Github size={20} /></Link>
                    <Link href="#" className="text-slate-500 hover:text-white transition"><Send size={20} /></Link>
                </div>

            </div>
        </footer>
    );
}
