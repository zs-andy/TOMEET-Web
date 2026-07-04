import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import FlowContent from "@/components/FlowContent";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-parchment">
        <Hero />
        <Manifesto />
        <FlowContent />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
