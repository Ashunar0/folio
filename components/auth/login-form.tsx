"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleLogo } from "./logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useAuthService } from "@/hooks/use-auth-service";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { user } = useAuth();
  const { signIn } = useAuthService();
  const supabase = createSupabaseBrowserClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });
  const [error, setError] = useState<string | null>(null);
  const hasNotice = Boolean(user || error);

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const email = values.email.trim();
    const password = values.password;
    try {
      await signIn({ email, password });

      // Check for redirect URL from query params
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      // Check for invite token in sessionStorage
      const inviteToken = sessionStorage.getItem("folio:invite-token");
      if (inviteToken) {
        sessionStorage.removeItem("folio:invite-token");
        router.push(`/invite/${inviteToken}`);
        return;
      }

      // Fetch user's teams to determine redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: teams } = await supabase
          .from("team_users")
          .select("team_id")
          .eq("user_id", user.id);

        if (!teams || teams.length === 0) {
          // No teams - go to onboarding
          router.push("/onboarding");
        } else if (teams.length === 1) {
          // One team - go directly to dashboard
          router.push(`/${teams[0].team_id}/dashboard`);
        } else {
          // Multiple teams - let user select
          router.push("/select-team");
        }
        toast.success("ログインしました");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to sign in. Please try again.";
      setError(message);
      toast.error("ログインに失敗しました", { description: message });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user && (
              <Alert>
                <AlertTitle>Signed in</AlertTitle>
                <AlertDescription>{user.email}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Could not sign in</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={cn(hasNotice && "mt-4")}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...register("email", { required: "Email is required" })}
                  required
                />
                {errors.email?.message && (
                  <FieldDescription className="text-destructive">
                    {errors.email.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  required
                />
                {errors.password?.message && (
                  <FieldDescription className="text-destructive">
                    {errors.password.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {/* <Field>
                <Button variant="outline" type="button">
                  <GoogleLogo />
                  Continue with Google
                </Button>
              </Field> */}
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  href={
                    redirectUrl
                      ? `/register?redirect=${encodeURIComponent(redirectUrl)}`
                      : "/register"
                  }
                >
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
