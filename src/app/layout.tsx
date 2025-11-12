import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fullstack Gestor AI",
  description: "Sistema inteligente de gestão de produtos com IA",
  // Favicon removido - usando icon.svg do Next.js automaticamente
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  // Aplicar tema baseado na preferência
                  if (theme === 'dark' || (theme === 'system' && systemPrefersDark) || (!theme && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light' || (theme === 'system' && !systemPrefersDark) || (!theme && !systemPrefersDark)) {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Erro ao aplicar tema:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased transition-colors duration-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
