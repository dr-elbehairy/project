'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { supabase } from '@/lib/db/supabase-client';
import type { ScoringWeights } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Settings,
    Key,
    Cpu,
    Scale,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Info,
    Database,
    ShieldCheck,
    Eye,
    EyeOff,
    RefreshCw,
    PlugZap
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PlatformSettings {
    id: string;
    openai_api_key: string | null;
    default_model: string;
}

interface WeightsForm {
    market_skills_weight: number;
    core_skills_weight: number;
    future_skills_weight: number;
    soft_skills_weight: number;
    wai_top_weight: number;
}

interface OpenAIModel {
    id: string;
    created: number;
    object: string;
    owned_by: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // AI & Platform Settings
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('');
    const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([]);
    const [showKey, setShowKey] = useState(false);
    const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking' | 'idle'>('idle');

    // Scoring Weights
    const [weightsRecord, setWeightsRecord] = useState<ScoringWeights | null>(null);
    const [weightsForm, setWeightsForm] = useState<WeightsForm>({
        market_skills_weight: 40,
        core_skills_weight: 30,
        future_skills_weight: 20,
        soft_skills_weight: 10,
        wai_top_weight: 40,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchOpenAIModels(key: string) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${key}` },
            });

            if (response.ok) {
                const data = await response.json();
                const filteredModels = data.data
                    .filter((m: OpenAIModel) => m.id.startsWith('gpt-'))
                    .map((m: OpenAIModel) => ({ id: m.id, name: m.id }))
                    .sort((a: any, b: any) => a.id.localeCompare(b.id));

                setAvailableModels(filteredModels);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to fetch models:', err);
            return false;
        }
    }

    async function handleConnectAPI() {
        if (!apiKey) return;
        setConnecting(true);
        setError(null);
        setApiStatus('checking');

        try {
            const success = await fetchOpenAIModels(apiKey);
            if (success) {
                setApiStatus('connected');
                // Save key to localStorage for immediate availability on next load
                localStorage.setItem('waqib_openai_api_key', apiKey);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
            } else {
                setApiStatus('disconnected');
                setError('فشل الاتصال: تأكد من صحة مفتاح API');
            }
        } catch (err) {
            setApiStatus('disconnected');
            setError('حدث خطأ أثناء محاولة الاتصال');
        } finally {
            setConnecting(false);
        }
    }

    async function fetchSettings() {
        setLoading(true);
        setError(null);
        try {
            // 1. Initial Load from LocalStorage (Optimistic)
            const localKey = localStorage.getItem('waqib_openai_api_key');
            const localModel = localStorage.getItem('waqib_default_model');
            if (localKey) setApiKey(localKey);
            if (localModel) setModel(localModel);

            // 2. Fetch from Supabase
            const { data: psData } = await supabase
                .from('platform_settings')
                .select('*')
                .maybeSingle();

            // 3. Sync State and Fetch Models
            const finalKey = psData?.openai_api_key || localKey || '';
            const finalModel = psData?.default_model || localModel || '';

            if (psData) setPlatformSettings(psData);
            if (finalKey) {
                setApiKey(finalKey);
                localStorage.setItem('waqib_openai_api_key', finalKey);
                setApiStatus('checking');
                const ok = await fetchOpenAIModels(finalKey);
                if (ok) {
                    setApiStatus('connected');
                    // Important: Set model only AFTER models are loaded to avoid Select reset
                    if (finalModel) {
                        setModel(finalModel);
                        localStorage.setItem('waqib_default_model', finalModel);
                    }
                } else {
                    setApiStatus('disconnected');
                }
            }

            // 4. Load Weights
            const { data: wData } = await supabase
                .from('scoring_weights')
                .select('*')
                .eq('is_default', true)
                .maybeSingle();

            if (wData) {
                setWeightsRecord(wData);
                setWeightsForm({
                    market_skills_weight: wData.market_skills_weight,
                    core_skills_weight: wData.core_skills_weight,
                    future_skills_weight: wData.future_skills_weight,
                    soft_skills_weight: wData.soft_skills_weight,
                    wai_top_weight: wData.wai_top_weight,
                });
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveAll() {
        setSaving(true);
        setError(null);
        try {
            // Save Settings
            const { error: psError } = await supabase
                .from('platform_settings')
                .upsert({
                    id: platformSettings?.id || '00000000-0000-0000-0000-000000000000',
                    openai_api_key: apiKey,
                    default_model: model,
                    updated_at: new Date().toISOString(),
                });

            if (psError) throw psError;

            // Sync with localStorage
            localStorage.setItem('waqib_openai_api_key', apiKey);
            localStorage.setItem('waqib_default_model', model);

            // Save Weights
            if (weightsRecord) {
                await supabase
                    .from('scoring_weights')
                    .update({
                        market_skills_weight: weightsForm.market_skills_weight,
                        core_skills_weight: weightsForm.core_skills_weight,
                        future_skills_weight: weightsForm.future_skills_weight,
                        soft_skills_weight: weightsForm.soft_skills_weight,
                        wai_top_weight: weightsForm.wai_top_weight,
                    })
                    .eq('id', weightsRecord.id);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('فشل في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    }

    function updateWeight(field: keyof WeightsForm, value: string) {
        const numValue = parseFloat(value) || 0;
        setWeightsForm((prev) => ({ ...prev, [field]: numValue }));
    }

    const clusterSum =
        weightsForm.market_skills_weight +
        weightsForm.core_skills_weight +
        weightsForm.future_skills_weight +
        weightsForm.soft_skills_weight;

    const isClusterValid = clusterSum === 100;

    if (loading) {
        return (
            <AppShell>
                <div className="max-w-4xl mx-auto space-y-8 animate-pulse" dir="rtl">
                    <div className="h-10 w-48 bg-muted rounded" />
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="h-64 bg-muted rounded" />
                        <div className="h-64 bg-muted rounded" />
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-8 pb-20" dir="rtl">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Settings className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">الإعدادات</h1>
                    </div>
                    <p className="text-muted-foreground mr-12">تحكم في خيارات المنصة والربط مع الذكاء الاصطناعي</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="bg-green-500/10 border-green-500/20 text-green-600 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>تم الحفظ والتحقق بنجاح</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* API Config */}
                        <Card className="overflow-hidden border-2 border-primary/5 transition-all hover:border-primary/20">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Key className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">مفتاح OpenAI API</CardTitle>
                                    </div>
                                    <Badge variant={apiStatus === 'connected' ? "secondary" : "outline"}
                                        className={apiStatus === 'connected' ? "bg-green-100 text-green-700 border-none" : ""}>
                                        {apiStatus === 'connected' ? 'متصل ونشط' : apiStatus === 'checking' ? 'جاري التحقق...' : 'غير متصل'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold">مفتاح التواصل</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 group">
                                            <Input
                                                type={showKey ? "text" : "password"}
                                                placeholder="sk-................................................"
                                                value={apiKey}
                                                onChange={(e) => {
                                                    setApiKey(e.target.value);
                                                    setApiStatus('idle');
                                                }}
                                                className="h-11 ps-4 pe-10 font-mono text-sm group-hover:border-primary/50 transition-colors"
                                                dir="ltr"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-2 top-1 h-9 w-9 text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowKey(!showKey)}
                                            >
                                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={handleConnectAPI}
                                            disabled={connecting || !apiKey}
                                            className="h-11 px-6 shadow-md shadow-primary/10"
                                        >
                                            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4 ml-2" />}
                                            ربط وتحميل النماذج
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="opacity-50" />

                                <div className={`space-y-4 transition-all duration-500 ${availableModels.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5 text-primary" />
                                        <Label className="text-sm font-semibold">اختر النموذج المستخدم</Label>
                                        {availableModels.length > 0 && (
                                            <Badge variant="outline" className="text-[10px] py-0">{availableModels.length} نموذج متاح</Badge>
                                        )}
                                    </div>
                                    <Select
                                        value={model}
                                        onValueChange={(val) => {
                                            setModel(val);
                                            localStorage.setItem('waqib_default_model', val);
                                        }}
                                    >
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder={availableModels.length > 0 ? "اختر النموذج المفضل" : "يرجى ربط المفتاح أولاً"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableModels.map((m) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weights */}
                        <Card className="overflow-hidden border-2 border-primary/5 transition-all hover:border-primary/20">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center gap-3">
                                    <Scale className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">أوزان التقييم (Scoring)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {Object.entries({
                                        market_skills_weight: 'مهارات السوق (%)',
                                        core_skills_weight: 'المهارات الأكاديمية (%)',
                                        future_skills_weight: 'مهارات المستقبل (%)',
                                        soft_skills_weight: 'المهارات الناعمة (%)'
                                    }).map(([key, label]) => (
                                        <div key={key} className="space-y-2">
                                            <Label className="text-xs text-muted-foreground mr-1">{label}</Label>
                                            <Input
                                                type="number"
                                                value={weightsForm[key as keyof WeightsForm]}
                                                onChange={(e) => updateWeight(key as keyof WeightsForm, e.target.value)}
                                                className="h-10 border-muted-foreground/20 focus:border-primary/50"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isClusterValid ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200 animate-pulse"
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${isClusterValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {isClusterValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <span className="font-black text-xl leading-none">{clusterSum} / 100</span>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">مجموع أوزان المجموعات المهارية</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div>
                                            <Label className="text-lg font-bold text-primary block">وزن WAI الرئيسي (%)</Label>
                                            <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">قوة تأثير التشابه المرجعي العام في النتيجة النهائية</p>
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                value={weightsForm.wai_top_weight}
                                                onChange={(e) => updateWeight('wai_top_weight', e.target.value)}
                                                className="text-center font-bold text-lg h-12 border-primary/30 bg-background"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-md">إجراءات الحفظ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button
                                    className="w-full h-12 text-md font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleSaveAll}
                                    disabled={saving || (apiStatus === 'connected' && !model)}
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
                                    حفظ الإعدادات
                                </Button>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> البيانات</span>
                                        <span className="text-green-600 font-medium">متصل وآمن</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> الذكاء الاصطناعي</span>
                                        <span className={apiStatus === 'connected' ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                                            {apiStatus === 'connected' ? 'جاهز للعمل' : 'بانتظار الربط'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
