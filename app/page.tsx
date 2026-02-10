"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  FileText,
  Trophy,
  BookOpen,
  Award,
  Briefcase,
  AlertTriangle,
  Search,
  LayoutGrid,
  ChevronLeft,
} from "lucide-react";

const problemCards = [
  {
    icon: AlertTriangle,
    title: "الفجوة التعليمية",
    description:
      "فجوة متزايدة بين مخرجات التعليم الأكاديمي ومتطلبات سوق العمل المتغيرة باستمرار",
  },
  {
    icon: Search,
    title: "غياب المرجعيات",
    description:
      "عدم وجود إطار مرجعي موحد لقياس جودة المناهج وموائمتها مع الاحتياجات الفعلية",
  },
  {
    icon: LayoutGrid,
    title: "غياب أداة التقييم",
    description:
      "افتقار المؤسسات التعليمية لأدوات تقييم ذكية وشاملة لتحليل المناهج الدراسية",
  },
  {
    icon: Trophy,
    title: "غياب معيار التصنيف",
    description:
      "عدم توفر معايير تصنيف عربية متخصصة لقياس موائمة البرامج الأكاديمية",
  },
];

const featureCards = [
  {
    icon: BarChart3,
    title: "مؤشر المواءمة WAI",
    subtitle: "تقرير التقييم",
    description:
      "مؤشر كمي دقيق يقيس مدى موائمة المناهج الدراسية مع متطلبات سوق العمل",
  },
  {
    icon: FileText,
    title: "تقرير الحلول",
    subtitle: "خطة التطوير",
    description:
      "تقارير تفصيلية بالتوصيات والحلول العملية لسد الفجوات المكتشفة",
  },
  {
    icon: Trophy,
    title: "التصنيف",
    subtitle: "Ranking",
    description:
      "نظام تصنيف عربي متخصص للبرامج الأكاديمية بناءً على مؤشرات الموائمة",
  },
  {
    icon: BookOpen,
    title: "المقررات القصيرة",
    subtitle: "Micro-Modules",
    description:
      "مقررات مصغرة متخصصة لسد فجوات المهارات وتعزيز كفاءات الخريجين",
  },
  {
    icon: Award,
    title: "الشهادات المهنية",
    subtitle: "Professional Certifications",
    description:
      "ربط المناهج بالشهادات المهنية المعتمدة عالميًا لتعزيز قيمة المخرجات",
  },
  {
    icon: Briefcase,
    title: "الوظائف المستقبلية",
    subtitle: "Future Jobs",
    description:
      "تحليل اتجاهات سوق العمل المستقبلية وربطها بالبرامج الأكاديمية",
  },
];

const howItWorksSteps = [
  {
    number: "01",
    title: "تحليل الخطط الدراسية",
    description: "رفع وتحليل الخطط الدراسية والمقررات باستخدام الذكاء الاصطناعي",
  },
  {
    number: "02",
    title: "بناء قائمة المهارات",
    description: "استخلاص المهارات المكتسبة وتصنيفها وفق أطر الكفاءات العالمية",
  },
  {
    number: "03",
    title: "المقارنة المرجعية",
    description:
      "مقارنة المهارات المستخرجة مع متطلبات سوق العمل والمعايير الدولية",
  },
  {
    number: "04",
    title: "تقرير الفجوات",
    description:
      "إصدار تقرير شامل يحدد الفجوات بين المخرجات الحالية والمتطلبات المستهدفة",
  },
  {
    number: "05",
    title: "التوصيات والحلول",
    description:
      "تقديم توصيات عملية وحلول مخصصة لتطوير المناهج وسد الفجوات المكتشفة",
  },
];

const stats = [
  {
    value: "40%",
    label: "مهارات تتغير",
    sublabel: "من المهارات المطلوبة تتغير كل 5 سنوات",
  },
  {
    value: "3.5",
    label: "نصف عمر المعرفة",
    sublabel: "سنوات متوسط صلاحية المعرفة التقنية",
  },
  {
    value: "6/10",
    label: "موظفين يحتاجون تأهيل",
    sublabel: "من الموظفين يحتاجون إعادة تأهيل مهاراتهم",
  },
];

export default function LandingPage() {
  return (
    <div dir="rtl" className="min-h-screen overflow-hidden">
      <nav className="fixed top-0 right-0 left-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <span
              className="text-2xl font-bold"
              style={{ color: "hsl(172, 66%, 50%)" }}
            >
              واكب
            </span>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  تسجيل الدخول
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  className="font-semibold"
                  style={{
                    backgroundColor: "hsl(172, 66%, 35%)",
                    color: "white",
                  }}
                >
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center bg-gray-900 pt-16">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: "hsl(172, 66%, 35%)" }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-8"
            style={{ backgroundColor: "hsl(45, 93%, 47%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1
              className="text-7xl sm:text-8xl lg:text-9xl font-bold mb-4 tracking-tight"
              style={{ color: "hsl(172, 66%, 50%)" }}
            >
              واكب
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4">
              نحو تعليم يواكب المستقبل
            </p>
            <p className="text-lg sm:text-xl text-gray-400 mb-3 font-light tracking-wide">
              Academic Program Alignment Benchmarking Platform
            </p>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              منصة ذكية لموائمة المناهج الجامعية مع متطلبات سوق العمل
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in stagger-2">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: "hsl(45, 93%, 47%)",
                  color: "hsl(210, 20%, 10%)",
                }}
              >
                ابدأ التجربة التجريبية
                <ChevronLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg font-semibold rounded-xl border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
              >
                تسجيل الدخول
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in stagger-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
              >
                <div
                  className="text-4xl font-bold mb-2"
                  style={{ color: "hsl(45, 93%, 47%)" }}
                >
                  {stat.value}
                </div>
                <div className="text-white font-semibold text-sm mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-xs leading-relaxed">
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-1.5">
            <div
              className="w-1.5 h-3 rounded-full animate-bounce"
              style={{ backgroundColor: "hsl(172, 66%, 50%)" }}
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{
                backgroundColor: "hsl(172, 66%, 35%, 0.1)",
                color: "hsl(172, 66%, 35%)",
              }}
            >
              المشكلة
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              لماذا واكب؟
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              تواجه المؤسسات التعليمية تحديات جوهرية في موائمة مخرجاتها مع
              متطلبات سوق العمل المتسارع
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.title}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in stagger-${index + 1}`}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{
                        backgroundColor: "hsl(0, 84%, 60%, 0.1)",
                      }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: "hsl(0, 84%, 60%)" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="py-24"
        style={{ backgroundColor: "hsl(210, 20%, 98%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{
                backgroundColor: "hsl(172, 66%, 35%, 0.1)",
                color: "hsl(172, 66%, 35%)",
              }}
            >
              الخدمات
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              خدمات المنصة
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              مجموعة متكاملة من الأدوات والخدمات لتحليل وتطوير البرامج
              الأكاديمية
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white animate-fade-in stagger-${(index % 5) + 1}`}
                >
                  <CardContent className="p-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        backgroundColor: "hsl(172, 66%, 35%, 0.1)",
                      }}
                    >
                      <Icon
                        className="h-7 w-7"
                        style={{ color: "hsl(172, 66%, 35%)" }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: "hsl(45, 93%, 42%)" }}
                    >
                      {feature.subtitle}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full mb-4"
              style={{
                backgroundColor: "hsl(172, 66%, 35%, 0.1)",
                color: "hsl(172, 66%, 35%)",
              }}
            >
              آلية العمل
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              طريقة عمل المنصة
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              خمس خطوات منهجية للوصول إلى تحليل شامل وتوصيات فعالة
            </p>
          </div>
          <div className="space-y-0">
            {howItWorksSteps.map((step, index) => (
              <div key={step.number} className="relative flex gap-6 pb-12 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg"
                    style={{
                      backgroundColor: "hsl(172, 66%, 35%)",
                    }}
                  >
                    {step.number}
                  </div>
                  {index < howItWorksSteps.length - 1 && (
                    <div
                      className="w-0.5 flex-1 mt-2"
                      style={{
                        backgroundColor: "hsl(172, 66%, 35%, 0.2)",
                      }}
                    />
                  )}
                </div>
                <div className="pt-1.5 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: "hsl(172, 66%, 35%)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-8"
            style={{ backgroundColor: "hsl(45, 93%, 47%)" }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            جرّب واكب الآن
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            اكتشف مدى موائمة برامجك الأكاديمية مع متطلبات سوق العمل من خلال
            تجربة تجريبية شاملة
          </p>
          <Link href="/dashboard?demo=true">
            <Button
              size="lg"
              className="h-14 px-12 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-105"
              style={{
                backgroundColor: "hsl(45, 93%, 47%)",
                color: "hsl(210, 20%, 10%)",
              }}
            >
              ابدأ التجربة التجريبية
              <ChevronLeft className="h-5 w-5 mr-2" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span
              className="text-xl font-bold"
              style={{ color: "hsl(172, 66%, 50%)" }}
            >
              واكب
            </span>
            <p className="text-gray-500 text-sm">
              واكب 2026 - Unicom AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
