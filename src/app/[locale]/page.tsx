import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="landing-main">
        <Hero />
        <Manifesto />
      </main>
    </>
  );
}
