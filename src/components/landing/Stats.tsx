"use client";

import { motion } from "framer-motion";

const stats = [
    { label: "Total Volume Traded", value: "$42M+", color: "text-blue-400" },
    { label: "Active Bots", value: "1,240", color: "text-white" },
    { label: "Avg Execution Time", value: "45ms", color: "text-green-400" },
    { label: "Markets Analyzed", value: "500/sec", color: "text-purple-400" }
];

export default function Stats() {
    return (
        <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm relative z-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <div className={`text-4xl md:text-5xl font-bold mb-2 ${s.color} font-mono tracking-tighter`}>
                            {s.value}
                        </div>
                        <div className="text-sm text-slate-500 uppercase tracking-widest font-medium">
                            {s.label}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
