import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Download, 
  Calendar,
  Settings,
  LucideIcon
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
  disabled?: boolean
}

export const dashboardNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do seu negócio",
  },
  {
    title: "Produtos",
    href: "/products",
    icon: Package,
    description: "Gerenciar produtos e estoque",
  },
  {
    title: "Financeiro",
    href: "/financial",
    icon: DollarSign,
    description: "Análises e transações financeiras",
  },
  {
    title: "Exportações",
    href: "/exports",
    icon: Download,
    description: "Exportar dados e catálogos",
  },
  {
    title: "Agenda",
    href: "/agenda",
    icon: Calendar,
    description: "Tarefas e compromissos",
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Configurações da conta e negócio",
  },
]



