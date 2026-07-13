import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const metadataBase = new URL("https://www.tomeet.chat");

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";
  const title = isEnglish
    ? "TOMEET - Find the right people through conversation"
    : "TOMEET — 用对话，找到对的人";
  const description = isEnglish
    ? "An AI-native social platform that helps you meet people and discover activities through conversation."
    : "AI agent 驱动的社交平台。通过对话找到志同道合的人和有趣的活动。";
  const canonicalPath = isEnglish ? "/en" : "/";

  return {
    metadataBase,
    title,
    description,
    applicationName: "TOMEET",
    alternates: {
      canonical: canonicalPath,
      languages: {
        "zh-CN": "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title,
      description,
      siteName: "TOMEET",
      locale: isEnglish ? "en_US" : "zh_CN",
      alternateLocale: isEnglish ? ["zh_CN"] : ["en_US"],
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TOMEET",
    url: "https://www.tomeet.chat/",
    description:
      locale === "en"
        ? "An AI-native social platform that helps you meet the right people through conversation."
        : "AI Agent 驱动的社交平台，通过对话找到对的人。",
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
