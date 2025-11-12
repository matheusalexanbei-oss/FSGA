export const siteConfig = {
  name: "Fullstack Gestor",
  description: "Sistema ERP com catalogação de produtos assistida por IA",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og-image.png",
  links: {
    github: "https://github.com/seu-usuario/fullstack-gestor",
  },
  creator: "Fullstack Gestor Team",
}

export type SiteConfig = typeof siteConfig


