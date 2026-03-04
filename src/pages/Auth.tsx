import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, Mail, Lock, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      // Determine flow
      formData.set("flow", step);
      await signIn("password", formData);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please check your credentials.",
      );
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      const redirect = redirectAfterAuth || "/";
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[350px] pb-0 border shadow-md">
            <CardHeader className="text-center">
              <div className="flex justify-center">
                <img
                  src="/assets/7e7b9501-d78c-4eb0-b98c-b49fdb807c8d.png"
                  alt="Site Logo"
                  width={64}
                  height={64}
                  className="rounded-lg mb-4 mt-4 cursor-pointer object-contain"
                  onClick={() => navigate("/")}
                />
              </div>
              <CardTitle className="text-xl">
                {step === "signIn" ? "Welcome Back" : "Create an Account"}
              </CardTitle>
              <CardDescription>
                {step === "signIn" ? "Log in to your account" : "Sign up with email and password"}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-4">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      name="password"
                      placeholder="Password"
                      type="password"
                      className="pl-9"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {step === "signIn" ? "Sign In" : "Sign Up"}
                </Button>

                <p className="text-sm text-muted-foreground text-center mt-4 mb-2">
                  {step === "signIn" ? "Don't have an account? " : "Already have an account? "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => {
                      setError(null);
                      setStep(step === "signIn" ? "signUp" : "signIn");
                    }}
                  >
                    {step === "signIn" ? "Sign Up" : "Sign In"}
                  </Button>
                </p>

                <div>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </form>

            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Secured by{" "}
              <span className="font-semibold">
                GojoStream
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}