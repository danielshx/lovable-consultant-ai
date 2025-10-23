import { mockAuth } from "@/lib/auth";
import { Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const user = mockAuth.getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    mockAuth.logout();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-gradient-hero shadow-card relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-3 shadow-glow border border-white/20 animate-pulse-glow">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
                AI Consultant Dashboard
              </h1>
              <p className="text-sm text-white/80 font-medium mt-0.5">
                Strategic Project Management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right glass px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-white/90 mt-0.5">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
