import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import { getCurrentAuthUser } from "@/lib/auth";
import { QR_SERVICE_ENABLED } from "@/lib/feature-flags";
import { createInitialWechatConnectSession } from "@/lib/wechat-connect-server";
import { connection } from "next/server";

const RAPID_QR_EMAIL = "andy4fe0119@gmail.com";

export default async function HomePage() {
  await connection();
  const [initialWechatSession, currentUser] = await Promise.all([
    QR_SERVICE_ENABLED ? createInitialWechatConnectSession() : null,
    getCurrentAuthUser(),
  ]);
  const rapidQrAvailable = currentUser?.email?.toLowerCase() === RAPID_QR_EMAIL;
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
        <Hero
          initialWechatSession={initialWechatSession}
          rapidQrAvailable={rapidQrAvailable}
          qrServiceAvailable={QR_SERVICE_ENABLED}
        />
        <Manifesto />
      </main>
    </>
  );
}
