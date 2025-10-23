import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockAuth } from "@/lib/auth";
import { Users, Loader2 } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("anna.schmidt@consulting.eu");
  const [password, setPassword] = useState("password123");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = mockAuth.login(email, password);
      
      if (user) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${user.name}`,
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password (min 6 characters)",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-subtle)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-lg bg-primary p-3 mb-4">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Consultant Dashboard</h1>
          <p className="text-muted-foreground mt-2">Strategic Project Management</p>
        </div>

        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your consultant dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="anna.schmidt@consulting.eu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Demo: Use any email with password (min 6 chars)
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
