"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/db/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2, Mail, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/update-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
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
              استعادة كلمة المرور
            </p>
          </CardHeader>
          <CardContent className="px-8 pt-6">
            {success ? (
              <div className="text-center py-8 space-y-3 animate-fade-in">
                <div
                  className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "hsl(172, 66%, 35%, 0.1)" }}
                >
                  <Mail
                    className="w-8 h-8"
                    style={{ color: "hsl(172, 66%, 35%)" }}
                  />
                </div>
                <h3 className="text-lg font-semibold">تم إرسال الرابط</h3>
                <p className="text-muted-foreground text-sm">
                  تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى
                  التحقق من صندوق الوارد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                <p className="text-sm text-muted-foreground text-center">
                  أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة
                  المرور.
                </p>
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
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "إرسال رابط الاستعادة"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center pb-8">
            <Link
              href="/auth/login"
              className="text-sm font-semibold hover:underline inline-flex items-center gap-2"
              style={{ color: "hsl(172, 66%, 35%)" }}
            >
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
