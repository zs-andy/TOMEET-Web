import "server-only";

import QRCode from "qrcode";
import type { CreatedWechatConnectSession } from "@/lib/wechat-connect";

function getWechatSessionUrl() {
  const configuredBaseUrl =
    process.env.TOMEET_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://api.tomeet.chat";
  const url = new URL(configuredBaseUrl);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/wechat/connect/sessions`;
  url.search = "";
  url.hash = "";
  return url;
}

export async function createInitialWechatConnectSession() {
  try {
    const response = await fetch(getWechatSessionUrl(), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;

    const session = (await response.json()) as Omit<
      CreatedWechatConnectSession,
      "qrCodeDataUrl"
    >;
    const qrSvg = await QRCode.toString(session.qrCodeContent, {
      type: "svg",
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#1c1b1b",
        light: "#ffffff",
      },
    });

    return {
      ...session,
      qrCodeDataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`,
    } satisfies CreatedWechatConnectSession;
  } catch {
    return null;
  }
}
