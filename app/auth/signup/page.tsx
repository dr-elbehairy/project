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
import { Loader2, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
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
            <p className="text-muted-foreground text-sm">إنشاء حساب جديد</p>
          </CardHeader>
          <CardContent className="px-8 pt-6">
            {success ? (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "hsl(172, 66%, 35%, 0.1)" }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "hsl(172, 66%, 35%)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">
                  تم إنشاء الحساب بنجاح
                </h3>
                <p className="text-muted-foreground text-sm">
                  يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب. سيتم توجيهك
                  لصفحة تسجيل الدخول.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="الاسم الكامل"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pe-10"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
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
                      placeholder="6 أحرف على الأقل"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="أعد كتابة كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pe-10"
                      dir="ltr"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "إنشاء حساب"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          {!success && (
            <CardFooter className="justify-center pb-8">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold hover:underline"
                  style={{ color: "hsl(172, 66%, 35%)" }}
                >
                  تسجيل الدخول
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
