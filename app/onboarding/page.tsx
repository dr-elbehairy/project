"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/db/auth-context";
import { getSupabase } from "@/lib/db/supabase-client";

const supabase = getSupabase();

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, Globe, UserCircle, Users } from "lucide-react";

const steps = [
  { key: "university", label: "اسم الجامعة", icon: Building2 },
  { key: "country", label: "الدولة", icon: Globe },
  { key: "contact", label: "الشخص المسؤول", icon: UserCircle },
  { key: "size", label: "حجم الجامعة", icon: Users },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [universityName, setUniversityName] = useState("");
  const [country, setCountry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [universitySize, setUniversitySize] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return universityName.trim().length > 0;
      case 1:
        return country.trim().length > 0;
      case 2:
        return contactPerson.trim().length > 0;
      case 3:
        return universitySize.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("يجب تسجيل الدخول أولاً");
      return;
    }

    setError("");
    setIsLoading(true);

    const { data: universityData, error: universityError } = await supabase
      .from("universities")
      .insert({
        name: universityName,
        country: country,
        size: universitySize,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (universityError) {
      setError(universityError.message);
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await updateProfile({
      university_id: universityData.id,
      onboarding_completed: true,
      contact_person: contactPerson,
    });

    if (profileError) {
      setError(profileError);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="universityName">اسم الجامعة</Label>
            <div className="relative">
              <Input
                id="universityName"
                type="text"
                placeholder="مثال: جامعة الملك سعود"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                disabled={isLoading}
                className="pe-10"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="country">الدولة</Label>
            <div className="relative">
              <Input
                id="country"
                type="text"
                placeholder="مثال: المملكة العربية السعودية"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isLoading}
                className="pe-10"
              />
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="contactPerson">الشخص المسؤول</Label>
            <div className="relative">
              <Input
                id="contactPerson"
                type="text"
                placeholder="الاسم الكامل للشخص المسؤول"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                disabled={isLoading}
                className="pe-10"
              />
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-2 animate-fade-in">
            <Label>حجم الجامعة</Label>
            <Select
              value={universitySize}
              onValueChange={setUniversitySize}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر حجم الجامعة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">صغيرة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="large">كبيرة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)",
      }}
    >
      <div className="w-full max-w-lg animate-fade-in">
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
              أكمل بيانات مؤسستك للبدء
            </p>
          </CardHeader>
          <CardContent className="px-8 pt-4 pb-8">
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor:
                          index <= currentStep
                            ? "hsl(172, 66%, 35%)"
                            : "hsl(210, 15%, 93%)",
                        color:
                          index <= currentStep
                            ? "white"
                            : "hsl(210, 10%, 45%)",
                      }}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className="w-8 h-0.5 mx-1 transition-all duration-300"
                        style={{
                          backgroundColor:
                            index < currentStep
                              ? "hsl(172, 66%, 35%)"
                              : "hsl(210, 15%, 93%)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">
                {steps[currentStep].label}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                الخطوة {currentStep + 1} من {steps.length}
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center mb-4">
                {error}
              </div>
            )}

            <div className="min-h-[80px]">{renderStepContent()}</div>

            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="flex-1 h-11"
                >
                  السابق
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                  className="flex-1 h-11 font-semibold"
                >
                  التالي
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex-1 h-11 font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "إكمال التسجيل"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
