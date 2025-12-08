import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowRight, Code, LineChart, Megaphone } from "lucide-react";

const positions = [
    {
        title: "Senior Rust Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        icon: Code
    },
    {
        title: "Quantitative Analyst",
        department: "Research",
        location: "New York / Remote",
        type: "Full-time",
        icon: LineChart
    },
    {
        title: "Growth Marketing Manager",
        department: "Marketing",
        location: "Remote",
        type: "Full-time",
        icon: Megaphone
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        Join the <span className="gradient-text">Revolution</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Help us build the future of algorithmic prediction market trading.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
                    <div className="space-y-4">
                        {positions.map((job, i) => (
                            <div key={i} className="glass p-6 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <job.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-indigo-300 transition-colors">{job.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                            <span>{job.department}</span>
                                            <span>•</span>
                                            <span>{job.location}</span>
                                            <span>•</span>
                                            <span>{job.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 text-center">
                        <h3 className="text-2xl font-bold mb-4">Don't see your role?</h3>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                            We are always looking for talented individuals to join our team.
                            Send your resume and a brief introduction to careers@polygraalx.app
                        </p>
                        <button className="btn-secondary">
                            Contact Us
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
