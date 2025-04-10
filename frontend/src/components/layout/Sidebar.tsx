import React from "react";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "react-router-dom";
import { BookOpen, Settings, User, Layout, LayoutDashboard, LogOut, Menu, ChevronLeft } from "lucide-react";
import { logout } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Sidebar as UISidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";

export const Sidebar: React.FC = () => {
  const { state, logout: authLogout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out.",
      });
    }
  };

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center py-3 px-6 rounded-lg transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"
        )
      }
      end
    >
      <Icon className="h-5 w-5 mr-3" />
      <span>{children}</span>
    </NavLink>
  );

  return (
    <UISidebar>
      <SidebarHeader className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg text-sidebar-foreground">CourseGPT</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="py-4">
        <div className="space-y-1 px-3">
          <NavItem to="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavItem>
          <NavItem to="/courses" icon={BookOpen}>
            My Courses
          </NavItem>
          <NavItem to="/create-course" icon={Layout}>
            Create Course
          </NavItem>
          <NavItem to="/settings" icon={Settings}>
            Settings
          </NavItem>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
        <Separator className="mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{state.user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{state.user?.username}</p>
              <p className="text-xs text-muted-foreground">{state.user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </SidebarFooter>
    </UISidebar>
  );
};
