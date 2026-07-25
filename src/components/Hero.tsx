"use client";

import { useLocale, useTranslations } from "next-intl";
import WechatQrEntry from "@/components/WechatQrEntry";
import type { CreatedWechatConnectSession } from "@/lib/wechat-connect";

export default function Hero({
  initialWechatSession,
  rapidQrAvailable,
}: {
  initialWechatSession: CreatedWechatConnectSession | null;
  rapidQrAvailable: boolean;
}) {
  const landing = useTranslations("landing");
  const access = useTranslations("access");
  const locale = useLocale();
  const isChinese = locale === "zh";

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-grid page-grid">
        <h1 id="hero-title" className="sr-only">
          {landing("heroUnderstand")} {landing("heroYou")} {landing("heroAre")} {landing("heroThen")} {landing("heroSocial")}
        </h1>

        {isChinese ? (
          <p
            className="hero-word hero-word-zh-understand"
            aria-hidden="true"
          >
            <span>{landing("heroUnderstand")}</span>
            <span>{landing("heroAre")}</span>
          </p>
        ) : (
          <>
            <p className="hero-word hero-word-learns" aria-hidden="true">
              {landing("heroUnderstand")}
            </p>
            <div className="hero-word hero-word-identity" aria-hidden="true">
              <span>{landing("heroYou")}</span>
              <span>{landing("heroAre")}</span>
            </div>
          </>
        )}

        <div className="hero-core">
          <div className="hero-access-choices" aria-label={access("wechatKicker")}>
            <WechatQrEntry
              initialSession={initialWechatSession}
              rapidRotationAvailable={rapidQrAvailable}
            />
          </div>
          <p className="hero-core-title">
            {landing("heroBridgeBefore")}
            <span className="hero-ai-native-anchor">
              {isChinese ? (
                <strong className="hero-ai-native-arrow hero-ai-native-arrow--before" aria-hidden="true">↑</strong>
              ) : null}
              <span className="soft-highlight">{landing("heroBridgeHighlight")}</span>
              {!isChinese ? (
                <>
                  {" "}
                  <strong className="hero-ai-native-arrow hero-ai-native-arrow--after" aria-hidden="true">↑</strong>
                </>
              ) : null}
            </span>
            {landing("heroBridgeAfter")}
          </p>
          <p className="hero-start-hint">{access("startHint")}</p>
        </div>

        {isChinese ? (
          <p className="hero-word hero-word-zh-connect" aria-hidden="true">
            <span className="hero-connect-line">{landing("heroThen")}</span>
            <span className="hero-connect-line">{landing("heroSocial")}</span>
          </p>
        ) : (
          <p className="hero-word hero-word-connect" aria-hidden="true">
            <span className="hero-connect-line">{landing("heroThen")}</span>
            <span className="hero-connect-line">{landing("heroSocial")}</span>
          </p>
        )}
      </div>
    </section>
  );
}
