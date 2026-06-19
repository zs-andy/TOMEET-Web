import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FlowContent from "@/components/FlowContent";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-white">
        <Hero />
        <FlowContent />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
