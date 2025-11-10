import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Tractor, 
  Beef, 
  Cable, 
  ClipboardList,
  Sprout
} from "lucide-react";

const navigation = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard },
  { name: "Задания", href: "/tasks", icon: ClipboardList },
  { name: "Персонал", href: "/staff", icon: Users },
  { name: "Техника", href: "/equipment", icon: Tractor },
  { name: "Животные", href: "/livestock", icon: Beef },
  { name: "Интеграции", href: "/integrations", icon: Cable },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <nav className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                АгроСистема
              </span>
            </div>
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
