"use client";

import { motion, Variants } from "framer-motion";
import { Radar, Crosshair, Users, Brain, Shield, Clock, TrendingUp, Zap } from "lucide-react";

const features = [
    {
        icon: Radar,
        title: "Market Radar",
        description: "Real-time scanning of all Polymarket events. Identify high-probability opportunities before anyone else.",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10",
    },
    {
        icon: Crosshair,
        title: "Precision Sniping",
        description: "Execute trades in milliseconds when conditions are met. Beat the crowd with automated speed.",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-500/10",
    },
    {
        icon: Users,
        title: "Copy Trading",
        description: "Mirror successful traders automatically. Learn from the best while your portfolio grows.",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-500/10",
    },
    {
        icon: Brain,
        title: "AI Oracle",
        description: "Machine learning models analyze news, social sentiment, and market data for predictions.",
        color: "from-orange-500 to-amber-500",
        bgColor: "bg-orange-500/10",
    },
    {
        icon: Shield,
        title: "Risk Management",
        description: "Set stop-losses, take-profits, and position limits. Protect your capital automatically.",
        color: "from-red-500 to-rose-500",
        bgColor: "bg-red-500/10",
    },
    {
        icon: Clock,
        title: "24/7 Monitoring",
        description: "Never miss an opportunity. Our systems watch the markets around the clock.",
        color: "from-indigo-500 to-violet-500",
        bgColor: "bg-indigo-500/10",
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};

export default function Features() {
    return (
        <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16 sm:mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                        <Zap size={14} className="text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">Powerful Features</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Everything You Need to{" "}
                        <span className="gradient-text">Win</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Professional-grade tools for prediction market trading.
                        Automate your strategy and maximize returns.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={itemVariants}
                            className="group card p-6 sm:p-8 hover:border-white/15"
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon size={28} className={`bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'currentColor' }} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {[
                        { value: "99.9%", label: "Uptime" },
                        { value: "<50ms", label: "Execution Speed" },
                        { value: "500+", label: "Active Users" },
                        { value: "$2M+", label: "Volume Traded" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center p-6 glass rounded-2xl">
                            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                                {stat.value}
                            </div>
                            <div className="text-sm text-slate-500">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
