"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import RadarShowcase from "@/components/landing/RadarShowcase";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06070A] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />
        <Stats />
        <Features />
        <RadarShowcase />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
