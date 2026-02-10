"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/db/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)",
      }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto mb-4">
              <span
                className="text-4xl font-bold"
                style={{ color: "hsl(172, 66%, 35%)" }}
              >
                واكب
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              منصة موائمة المناهج الأكاديمية
            </p>
          </CardHeader>
          <CardContent className="px-8 pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pe-10"
                    dir="ltr"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pe-10"
                    dir="ltr"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-start">
                <Link
                  href="/auth/reset-password"
                  className="text-sm hover:underline"
                  style={{ color: "hsl(172, 66%, 35%)" }}
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center pb-8">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link
                href="/auth/signup"
                className="font-semibold hover:underline"
                style={{ color: "hsl(172, 66%, 35%)" }}
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
