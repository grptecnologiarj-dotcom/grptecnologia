import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DeskControl — Gestão completa para assistência técnica",
    template: "%s | DeskControl",
  },
  description:
    "Plataforma SaaS premium para gestão de assistência técnica, suporte de TI e field service. Ordens de serviço, clientes, financeiro, estoque e muito mais.",
  applicationName: "DeskControl",
  keywords: [
    "assistência técnica",
    "ordem de serviço",
    "gestão",
    "field service",
    "suporte de TI",
    "SaaS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
        {children}
      </body>
    </html>
  );
}