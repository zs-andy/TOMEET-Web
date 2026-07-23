import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const metadataBase = new URL("https://www.tomeet.chat");

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  await params;
  const title = "TOMEET - Find the right people through conversation";
  const description =
    "An AI-native social platform that helps you meet people and discover activities through conversation.";

  return {
    metadataBase,
    title,
    description,
    applicationName: "TOMEET",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: "/",
      title,
      description,
      siteName: "TOMEET",
      locale: "en_US",
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

  if (!routing.locales.includes(locale as "en")) {
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
      "An AI-native social platform that helps you meet the right people through conversation.",
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
