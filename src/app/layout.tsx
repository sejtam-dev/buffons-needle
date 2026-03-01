import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Buffon's Needle — π Estimator",
    description: "Interactive Buffon's Needle simulation that estimates π through geometric probability.",
};

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </NextIntlClientProvider>
        </body>
        </html>
    );
}
