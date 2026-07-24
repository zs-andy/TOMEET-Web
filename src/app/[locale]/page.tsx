import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import { getCurrentAuthUser } from "@/lib/auth";
import { createInitialWechatConnectSession } from "@/lib/wechat-connect-server";
import { connection } from "next/server";

const DEFAULT_RAPID_QR_EMAIL = "andy4fe0119@gmail.com";

export default async function HomePage() {
  await connection();
  const [initialWechatSession, currentUser] = await Promise.all([
    createInitialWechatConnectSession(),
    getCurrentAuthUser(),
  ]);
  const rapidQrEmail = (
    process.env.WECHAT_RAPID_QR_EMAIL ?? DEFAULT_RAPID_QR_EMAIL
  ).toLowerCase();
  const rapidQrRotation = currentUser?.email?.toLowerCase() === rapidQrEmail;

  return (
    <>
      <Navbar />
      <main className="landing-main">
        <Hero
          initialWechatSession={initialWechatSession}
          rapidQrRotation={rapidQrRotation}
        />
        <Manifesto />
      </main>
    </>
  );
}
