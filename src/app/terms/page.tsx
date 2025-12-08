import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-slate-400 mb-6">Last updated: December 9, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Agreement to Terms</h2>
                        <p className="text-slate-400">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and PolyGraalX ("we," "us" or "our"), concerning your access to and use of the PolyGraalX website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Intellectual Property Rights</h2>
                        <p className="text-slate-400">
                            Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. User Representations</h2>
                        <p className="text-slate-400 mb-4">
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-6 text-slate-400 space-y-2">
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                            <li>You are not a minor in the jurisdiction in which you reside.</li>
                            <li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise (except for the authorized use of our trading bot services).</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Disclaimer</h2>
                        <p className="text-slate-400">
                            The Site is provided on an as-is and as-available basis. You agree that your use of the Site and our services will be at your sole risk. To the fullest extent permitted by law, we disclaim all warranties, express or implied, in connection with the Site and your use thereof, including, without limitation, the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                        <p className="text-slate-400 mt-4">
                            <strong>Risk Warning:</strong> Trading in prediction markets involves a high degree of risk and may result in the loss of your entire investment. You should carefully consider whether trading is suitable for you in light of your financial condition.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Contact Us</h2>
                        <p className="text-slate-400">
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:legal@polygraalx.app" className="text-indigo-400 hover:text-indigo-300">legal@polygraalx.app</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
