import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ThemeCycleSync from "@/components/ThemeCycleSync";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const metadataBase = new URL("https://www.tomeet.chat");
const tomeetWordmark = Geist({
  variable: "--font-tomeet-wordmark",
  subsets: ["latin"],
  display: "swap",
});
const xiangcuiDengcusongLanding = localFont({
  src: "../fonts/xiangcui-dengcusong-landing.woff2",
  variable: "--font-xiangcui-dengcusong-landing",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Songti SC", "STSong", "serif"],
  adjustFontFallback: false,
});
const xiangcuiDengcusongAgent = localFont({
  src: "../fonts/xiangcui-dengcusong.woff2",
  variable: "--font-xiangcui-dengcusong-agent",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: false,
  fallback: ["Songti SC", "STSong", "serif"],
  adjustFontFallback: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const isChinese = locale === "zh";
  const title = isChinese
    ? "TOMEET - 用对话，找到对的人"
    : "TOMEET - Find the right people through conversation";
  const description = isChinese
    ? "一个通过自然对话理解你，并帮助你认识合拍的人、发现合适活动的 AI Native 社交平台。"
    : "An AI-native social platform that helps you meet people and discover activities through conversation.";
  const canonical = isChinese ? "/" : "/en";

  return {
    metadataBase,
    title,
    description,
    applicationName: "TOMEET",
    alternates: {
      canonical,
      languages: {
        en: "/en",
        zh: "/",
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "TOMEET",
      locale: isChinese ? "zh_CN" : "en_US",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "TOMEET",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const isChinese = locale === "zh";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOMEET",
    url: isChinese ? "https://www.tomeet.chat/" : "https://www.tomeet.chat/en",
    inLanguage: isChinese ? "zh-CN" : "en",
    description: isChinese
      ? "一个通过自然对话理解你，并帮助你认识合拍的人的 AI Native 社交平台。"
      : "An AI-native social platform that helps you meet the right people through conversation.",
  };

  return (
    <html
      lang={locale}
      className={`${tomeetWordmark.variable} ${xiangcuiDengcusongLanding.variable} ${xiangcuiDengcusongAgent.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeCycleSync />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
