import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Zap, Shield, Users, Globe } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        About <span className="gradient-text">PolyGraalX</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                        We are on a mission to democratize algorithmic trading for prediction markets.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            PolyGraalX was founded with a simple belief: that the power of prediction markets should be accessible to everyone, not just institutional players with high-frequency trading algorithms.
                        </p>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            We combine cutting-edge AI with real-time data analysis to provide traders with the tools they need to make informed decisions and automate their strategies on Polymarket.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 glass rounded-2xl">
                            <Zap className="text-indigo-400 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Speed</h3>
                            <p className="text-slate-500">Microsecond execution latency</p>
                        </div>
                        <div className="p-6 glass rounded-2xl">
                            <Shield className="text-green-400 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Security</h3>
                            <p className="text-slate-500">Enterprise-grade protection</p>
                        </div>
                        <div className="p-6 glass rounded-2xl">
                            <Users className="text-purple-400 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Community</h3>
                            <p className="text-slate-500">Thousands of active traders</p>
                        </div>
                        <div className="p-6 glass rounded-2xl">
                            <Globe className="text-blue-400 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">Global</h3>
                            <p className="text-slate-500">Markets from around the world</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-12">Our Values</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 glass rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">Transparency</h3>
                            <p className="text-slate-400">
                                We believe in open source principles and clear communication about how our algorithms work.
                            </p>
                        </div>
                        <div className="p-8 glass rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">Innovation</h3>
                            <p className="text-slate-400">
                                We constantly push the boundaries of what's possible in DeFi and prediction markets.
                            </p>
                        </div>
                        <div className="p-8 glass rounded-2xl">
                            <h3 className="text-xl font-bold mb-4">User First</h3>
                            <p className="text-slate-400">
                                Every feature we build is designed to solve real problems for our community of traders.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
