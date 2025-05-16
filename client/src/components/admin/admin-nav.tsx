import { useLocation, Link } from "wouter";
import { useState } from "react";
import { 
  BarChart, 
  Users, 
  Video, 
  Book,
  ChevronDown,
  ChevronRight,
  Laptop
} from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(true);

  // Navigation items for admin
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <BarChart className="h-4 w-4 mr-2" />,
    },
    {
      title: "Applications",
      icon: <Users className="h-4 w-4 mr-2" />,
      children: [
        {
          title: "Livestreamer",
          href: "/admin/livestreamer-applications",
          icon: <Video className="h-4 w-4 mr-2" />,
        },
        {
          title: "Apologist Scholar",
          href: "/admin/apologist-scholar-applications",
          icon: <Book className="h-4 w-4 mr-2" />,
        },
      ],
    },
    {
      title: "Return to Site",
      href: "/",
      icon: <Laptop className="h-4 w-4 mr-2" />,
      className: "mt-auto text-muted-foreground hover:text-primary",
    },
  ];

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>

      <nav className="flex-1 overflow-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            // For items with children (submenus)
            if (item.children) {
              return (
                <li key={index}>
                  <Collapsible
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    className="w-full"
                  >
                    <CollapsibleTrigger className="flex items-center w-full p-2 hover:bg-accent rounded-md text-sm font-medium">
                      {item.icon}
                      <span className="flex-1 text-left">{item.title}</span>
                      {menuOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="pl-4 mt-1 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex}>
                            <Link href={child.href}>
                              <div className={cn(
                                "flex items-center p-2 hover:bg-accent rounded-md text-sm cursor-pointer",
                                location === child.href ? "bg-accent/50 font-medium" : ""
                              )}>
                                {child.icon}
                                {child.title}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </li>
              );
            }

            // For regular menu items without children
            return (
              <li key={index}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center p-2 hover:bg-accent rounded-md text-sm cursor-pointer",
                    item.className,
                    location === item.href ? "bg-accent/50 font-medium" : ""
                  )}>
                    {item.icon}
                    {item.title}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}