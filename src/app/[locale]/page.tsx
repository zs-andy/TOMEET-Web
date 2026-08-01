import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import { getCurrentAuthUser } from "@/lib/auth";

export default async function HomePage() {
  const currentUser = await getCurrentAuthUser();
  const viewer = currentUser
    ? {
        id: currentUser.id,
        avatarUrl: currentUser.avatarUrl,
        label: currentUser.label,
      }
    : null;

  return (
    <>
      <Navbar viewer={viewer} />
      <main className="landing-main">
        <Hero />
        <Manifesto />
      </main>
    </>
  );
}
