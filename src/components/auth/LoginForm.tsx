import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Eye, EyeOff, Linkedin, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, setLoading, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "password123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      // Demo mode - simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser = {
        id: "1",
        email: data.email,
        name: "Demo User",
        role: "admin",
      };

      login(mockUser, "demo-token");
      toast.success("Demo Mode: Welcome back!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
            <Linkedin className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to your LinkedIn Automation Dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={cn(
                  "h-11 transition-all duration-200",
                  errors.email
                    ? "border-destructive focus:border-destructive"
                    : "focus:border-primary"
                )}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className={cn(
                    "h-11 pr-11 transition-all duration-200",
                    errors.password
                      ? "border-destructive focus:border-destructive"
                      : "focus:border-primary"
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-primary text-sm">
                    Demo Credentials
                  </p>
                  <div className="text-sm text-primary/80 space-y-1">
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      admin@example.com
                    </p>
                    <p>
                      <span className="font-medium">Password:</span> password123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If the backend server is not running, the app will work in demo
                mode with mock data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
