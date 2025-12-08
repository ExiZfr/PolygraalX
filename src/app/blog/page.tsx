import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

const posts = [
    {
        title: "Understanding Prediction Market Liquidity",
        excerpt: "Why liquidity matters more than you think when trading on Polymarket, and how to analyze it.",
        date: "Dec 8, 2024",
        author: "Alex Rivera",
        category: "Trading Strategy"
    },
    {
        title: "The Rise of AI in DeFi Trading",
        excerpt: "How artificial intelligence is reshaping the landscape of decentralized finance and prediction markets.",
        date: "Dec 5, 2024",
        author: "Sarah Chen",
        category: "Industry Trends"
    },
    {
        title: "PolyGraalX v2.0 Release Notes",
        excerpt: "Introducing advanced sniping tools, improved copy trading latency, and a brand new dashboard.",
        date: "Nov 28, 2024",
        author: "PolyGraalX Team",
        category: "Product Update"
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        The <span className="gradient-text">PolyGraalX</span> Blog
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Insights, updates, and strategies from the team and community.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <article key={i} className="glass rounded-2xl overflow-hidden hover:bg-white/[0.02] transition-colors group cursor-pointer">
                            <div className="h-48 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 w-full" />
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                    <span className="text-indigo-400 font-medium">{post.category}</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {post.date}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-300 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <User size={14} />
                                        {post.author}
                                    </div>
                                    <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
