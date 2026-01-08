import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Users, 
  Tractor, 
  Beef, 
  Cable, 
  ClipboardList,
  Sprout,
  Settings,
  Cog
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard },
  { name: "Задания", href: "/tasks", icon: ClipboardList },
  { name: "Агро-операции", href: "/agro-operations", icon: Cog },
  { name: "Персонал", href: "/staff", icon: Users },
  { name: "Техника", href: "/equipment", icon: Tractor },
  { name: "Животные", href: "/livestock", icon: Beef },
  { name: "Интеграции", href: "/integrations", icon: Cable },
  { name: "Настройки", href: "/settings", icon: Settings },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-60"}>
      <SidebarHeader className="border-b border-border">
        <div className="flex items-center space-x-2 p-2">
          <div className="bg-primary rounded-lg p-2">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              АгроСистема
            </span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink 
                        to={item.href} 
                        end
                        className="flex items-center space-x-2"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-secondary/30 to-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center px-4">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
