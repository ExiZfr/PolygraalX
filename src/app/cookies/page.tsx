import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-[#06070A] text-white overflow-x-hidden">
            <Navbar />
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-slate-400 mb-6">Last updated: December 9, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. What Are Cookies</h2>
                        <p className="text-slate-400">
                            Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. How We Use Cookies</h2>
                        <p className="text-slate-400 mb-4">
                            We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. The Cookies We Set</h2>
                        <ul className="list-disc pl-6 text-slate-400 space-y-4">
                            <li>
                                <strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.
                            </li>
                            <li>
                                <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
                            </li>
                            <li>
                                <strong>Site preferences cookies:</strong> In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need to set cookies so that this information can be called whenever you interact with a page is affected by your preferences.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Third Party Cookies</h2>
                        <p className="text-slate-400">
                            In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
                        </p>
                        <ul className="list-disc pl-6 text-slate-400 mt-4">
                            <li>
                                This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">5. More Information</h2>
                        <p className="text-slate-400">
                            Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                        </p>
                        <p className="text-slate-400 mt-4">
                            For more general information on cookies, please read "What Are Cookies".
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
