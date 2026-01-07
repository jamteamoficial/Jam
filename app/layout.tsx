import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import HeaderWrapper from "./components/HeaderWrapper";
import { Toaster } from "@/components/ui/toaster";
import JamAnimation from "./components/JamAnimation";

export const metadata: Metadata = {
  title: "App para Músicos",
  description: "Plataforma para músicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <HeaderWrapper>
            {children}
          </HeaderWrapper>
          <Toaster />
          <JamAnimation />
        </AuthProvider>
      </body>
    </html>
  );
}


