'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, ChevronDown, LayoutDashboard, List, LucideIcon, PiggyBank, Rocket, Settings, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/transactions", icon: List, label: "Transactions" },
  { href: "/dashboard/debts", icon: PiggyBank, label: "Debts & Subscriptions" },
  { href: "/dashboard/goals", icon: Target, label: "Savings Goals" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card/20 p-4 md:flex">
      <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-8">
        <Rocket className="h-7 w-7" />
        <h1 className="font-headline">FA Vision</h1>
      </div>

      <div className="mb-4">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link href={item.href} key={item.label}>
            <Button
              variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 px-3"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1">
        <Link href="/dashboard/settings">
            <Button
              variant={pathname.startsWith("/dashboard/settings") ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 px-3"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Button>
        </Link>
        <UserMenu />
      </div>
    </aside>
  );
}

function WorkspaceSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="truncate">Personal Finance</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          Personal Finance
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          Family
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Building className="mr-2 h-4 w-4" />
          FA Brokers
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Create Workspace</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-3 py-2 text-left">
              <Avatar className="h-9 w-9">
                <AvatarImage data-ai-hint="profile picture" src="https://picsum.photos/100" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                 <p className="truncate text-sm font-semibold">User Name</p>
                 <p className="text-xs text-muted-foreground">user@favision.com</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}
