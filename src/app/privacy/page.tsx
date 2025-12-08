import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-slate-400 mb-6">Last updated: December 9, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
                        <p className="text-slate-400">
                            PolyGraalX ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our trading bot services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Information We Collect</h2>
                        <p className="text-slate-400 mb-4">
                            We may collect information about you in a variety of ways. The information we may collect includes:
                        </p>
                        <ul className="list-disc pl-6 text-slate-400 space-y-2">
                            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and wallet address that you voluntarily give to us when you register with the Site.</li>
                            <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                            <li><strong>Financial Data:</strong> We do NOT store your private keys. We only store public wallet addresses and transaction history related to our service.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Use of Your Information</h2>
                        <p className="text-slate-400 mb-4">
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-400 space-y-2">
                            <li>Create and manage your account.</li>
                            <li>Process your transactions and trading strategies.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Security of Your Information</h2>
                        <p className="text-slate-400">
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Contact Us</h2>
                        <p className="text-slate-400">
                            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@polygraalx.app" className="text-indigo-400 hover:text-indigo-300">privacy@polygraalx.app</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
