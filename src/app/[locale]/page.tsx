import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import { createInitialWechatConnectSession } from "@/lib/wechat-connect-server";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const initialWechatSession = await createInitialWechatConnectSession();

  return (
    <>
      <Navbar />
      <main className="landing-main">
        <Hero initialWechatSession={initialWechatSession} />
        <Manifesto />
      </main>
    </>
  );
}
