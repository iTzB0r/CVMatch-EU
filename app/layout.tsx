import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVMatch EU — Seu currículo pronto para a Europa",
  description:
    "Descubra em segundos se o seu currículo está preparado para aquela vaga na Europa e otimize-o para aumentar sua compatibilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
