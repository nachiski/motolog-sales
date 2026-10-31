import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MotoLog | Ventas de motocicletas",
  description: "Todas tus ventas de motocicletas en un solo lugar.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-419" suppressHydrationWarning>
      <body className="antialiased"><script dangerouslySetInnerHTML={{__html:"(()=>{let t;try{t=localStorage.getItem(\"motolog-theme\")}catch{}document.documentElement.dataset.theme=t===\"dark\"||t!==\"light\"&&window.matchMedia(\"(prefers-color-scheme: dark)\").matches?\"dark\":\"light\"})()"}}/>{children}</body>
    </html>
  );
}
