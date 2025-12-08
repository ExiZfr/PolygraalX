import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Mail, MessageCircle, Twitter } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Have questions? We're here to help. Reach out to our team.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="glass p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold mb-6">Contact Channels</h2>
                            <div className="space-y-6">
                                <a href="mailto:support@polygraalx.app" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Email Support</div>
                                        <div className="text-sm">support@polygraalx.app</div>
                                    </div>
                                </a>
                                <a href="https://t.me/Plmktradingbot" target="_blank" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                        <MessageCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Telegram Community</div>
                                        <div className="text-sm">@Plmktradingbot</div>
                                    </div>
                                </a>
                                <a href="https://twitter.com" target="_blank" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                                        <Twitter size={24} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">Twitter</div>
                                        <div className="text-sm">Follow for updates</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="glass p-8 rounded-2xl">
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="How can we help you?" />
                            </div>
                            <button type="submit" className="btn-primary w-full justify-center">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
