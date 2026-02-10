'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { supabase } from '@/lib/db/supabase-client';
import { useAuth } from '@/lib/db/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Upload,
    FileText,
    Cpu,
    Loader2,
    AlertCircle,
    X,
    FileUp,
    ChevronRight,
    Sparkles,
    Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface OpenAIModel {
    id: string;
    name: string;
}

export default function NewAnalysisPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [universityName, setUniversityName] = useState('');
    const [disciplineName, setDisciplineName] = useState('');
    const [degreeLevel, setDegreeLevel] = useState('bachelor');
    const [analysisGoal, setAnalysisGoal] = useState('academic');
    const [selectedModel, setSelectedModel] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State
    const [availableModels, setAvailableModels] = useState<OpenAIModel[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const localKey = localStorage.getItem('waqib_openai_api_key');
            if (localKey) {
                await fetchModels(localKey);
            }

            const { data: psData } = await supabase
                .from('platform_settings')
                .select('*')
                .maybeSingle();

            if (psData) {
                setSelectedModel(psData.default_model || '');
                if (psData.openai_api_key && psData.openai_api_key !== localKey) {
                    await fetchModels(psData.openai_api_key);
                    localStorage.setItem('waqib_openai_api_key', psData.openai_api_key);
                }
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchModels(key: string) {
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            if (response.ok) {
                const data = await response.json();
                const filtered = data.data
                    .filter((m: any) => m.id.startsWith('gpt-'))
                    .map((m: any) => ({ id: m.id, name: m.id }))
                    .sort((a: any, b: any) => a.id.localeCompare(b.id));
                setAvailableModels(filtered);
            }
        } catch (err) {
            console.error('Failed to fetch models:', err);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
        }
    };

    const isValidFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        return validTypes.includes(file.type);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    async function handleStartAnalysis() {
        if (!universityName || !disciplineName || !file || !selectedModel) {
            setError('يرجى إكمال جميع الحقول المطلوبة ورفع ملف الخطة الدراسية');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: analysis, error: insertError } = await supabase
                .from('analyses')
                .insert({
                    created_by: user?.id,
                    university_name: universityName,
                    discipline_name: disciplineName,
                    degree_level: degreeLevel,
                    analysis_goal: analysisGoal,
                    status: 'pending',
                    benchmark_source: 'QS',
                    model: selectedModel,
                    filename: file.name
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Redirect back to dashboard to see the progress
            router.push('/analyses');
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء بدء التحليل');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppShell>
            <div className="min-h-screen text-foreground p-6 md:p-12 flex flex-col items-center">
                <div className="max-w-4xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-2 text-primary text-sm font-bold tracking-widest uppercase">
                            <Sparkles className="h-4 w-4" />
                            مدعوم بالذكاء الاصطناعي
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter text-foreground">
                            تحليل جديد
                        </h1>
                        <p className="text-muted-foreground text-xl font-medium max-w-lg mx-auto">ارفع خطتك الدراسية ودع محركنا الذكي يستخلص الفجوات المعرفية</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: File Upload */}
                        <div className="lg:col-span-7 space-y-6">
                            <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <FileUp className="h-3 w-3" />
                                ملف الخطة الدراسية *
                            </Label>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative aspect-[4/3] rounded-[2.5rem] border-2 border-dashed
                                    flex flex-col items-center justify-center gap-6 cursor-pointer
                                    transition-all duration-700 group overflow-hidden
                                    ${isDragging
                                        ? 'border-primary bg-primary/10 scale-95'
                                        : 'border-border bg-card/60 hover:bg-card hover:border-primary/20'
                                    }
                                    ${file ? 'border-primary/50 bg-primary/5' : ''}
                                `}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.txt"
                                    className="hidden"
                                />

                                {file ? (
                                    <div className="z-10 text-center space-y-6 font-rtl" dir="rtl">
                                        <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                            <FileText className="h-10 w-10 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-2xl tracking-tight text-foreground">{file.name}</p>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="bg-muted hover:bg-muted/80 text-xs font-bold rounded-full px-6"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                            }}
                                        >
                                            <X className="h-3 w-3 mr-2" />
                                            إلغاء الملف
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="z-10 text-center space-y-6">
                                        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-700">
                                            <Upload className="h-10 w-10 text-muted-foreground/40 group-hover:text-primary" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-2xl font-black tracking-tight text-foreground">اسحب الملف هنا</p>
                                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">أو انقر للتصفح</p>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground">PDF</Badge>
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground">DOCX</Badge>
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground">TXT</Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Form Fields */}
                        <div className="lg:col-span-5 space-y-10 py-6">

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">اسم الجامعة والجهة</Label>
                                    <Input
                                        placeholder="اسم الجامعة..."
                                        value={universityName}
                                        onChange={(e) => setUniversityName(e.target.value)}
                                        className="h-16 bg-card border-border focus:ring-primary text-xl font-bold rounded-2xl placeholder:text-muted-foreground/30 transition-all text-right"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">مسمى التخصص الأكاديمي</Label>
                                    <Input
                                        placeholder="اسم التخصص..."
                                        value={disciplineName}
                                        onChange={(e) => setDisciplineName(e.target.value)}
                                        className="h-16 bg-card border-border focus:ring-primary text-xl font-bold rounded-2xl placeholder:text-muted-foreground/30 transition-all text-right"
                                        dir="rtl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6" dir="rtl">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">المستوى</Label>
                                        <Select value={degreeLevel} onValueChange={setDegreeLevel}>
                                            <SelectTrigger className="h-14 bg-card border-border text-sm font-bold rounded-2xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                <SelectItem value="bachelor" className="font-bold">بكالوريوس</SelectItem>
                                                <SelectItem value="master" className="font-bold">ماجستير</SelectItem>
                                                <SelectItem value="doctorate" className="font-bold">دكتوراه</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">هدف التحليل</Label>
                                        <Select value={analysisGoal} onValueChange={setAnalysisGoal}>
                                            <SelectTrigger className="h-14 bg-card border-border text-sm font-bold rounded-2xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                <SelectItem value="academic" className="font-bold">أكاديمي</SelectItem>
                                                <SelectItem value="professional" className="font-bold">مهني</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border">
                                    <div className="flex items-center justify-between" dir="rtl">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">نموذج الذكاء الاصطناعي</Label>
                                        <Shield className="h-3 w-3 text-emerald-600" />
                                    </div>
                                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                                        <SelectTrigger className="h-16 bg-card border-border text-primary font-black rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Cpu className="h-4 w-4" />
                                                <SelectValue placeholder="اختر النموذج" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {availableModels.length > 0 ? (
                                                availableModels.map((m) => (
                                                    <SelectItem key={m.id} value={m.id} className="font-bold">{m.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="gpt-4o" className="font-bold text-primary">GPT-4o (افتراضي)</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive" className="rounded-2xl">
                                    <AlertDescription className="flex items-center gap-2 font-bold text-xs">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                onClick={handleStartAnalysis}
                                disabled={submitting || loading}
                                className="w-full h-20 text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 rounded-[2rem] shadow-lg transition-all duration-500 active:scale-[0.97] group"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        جاري تهيئة المحرك...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        ابدأ التحليل النوعي
                                        <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
