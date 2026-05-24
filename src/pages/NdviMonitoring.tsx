import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Satellite, Plane, Upload, MapPin, AlertTriangle, TrendingDown, TrendingUp,
  Sparkles, Leaf, Droplets, Activity, CheckCircle2, ChevronRight, FileImage,
  Calendar, Layers, Map as MapIcon, Cog, FileUp, Brain, Target, Eye
} from "lucide-react";
import { toast } from "sonner";

// ====== Типы ======
type RiskLevel = "low" | "medium" | "high";
type SourceType = "sentinel-2" | "landsat" | "drone" | "other";

interface NdviPoint {
  date: string;
  value: number;
}

interface ProblemZone {
  id: string;
  label: string;
  area: number; // га
  ndvi: number;
  risk: RiskLevel;
  issue: string;
}

interface AiRecommendation {
  id: string;
  fieldId: string;
  fieldName: string;
  operation: string;
  reason: string;
  risk: RiskLevel;
  priority: "Низкий" | "Средний" | "Высокий";
  date: string;
  accepted?: boolean;
}

interface Field {
  id: string;
  name: string;
  crop: string;
  area: number;
  avgNdvi: number;
  risk: RiskLevel;
  lastUpdate: string;
  trend: "up" | "down" | "stable";
  history: NdviPoint[];
  zones: ProblemZone[];
  aiSummary: string[];
  source: SourceType;
  polygon: { x: number; y: number }[];
}

interface DroneUpload {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "processing" | "ready" | "error";
  progress: number;
  date: string;
  avgNdvi?: number;
}

// ====== Mock данные ======
const initialFields: Field[] = [
  {
    id: "f1",
    name: "Поле №1",
    crop: "Озимая пшеница",
    area: 124.5,
    avgNdvi: 0.78,
    risk: "low",
    lastUpdate: "2026-05-22",
    trend: "up",
    source: "sentinel-2",
    history: [
      { date: "01.04", value: 0.42 },
      { date: "15.04", value: 0.55 },
      { date: "01.05", value: 0.68 },
      { date: "15.05", value: 0.74 },
      { date: "22.05", value: 0.78 },
    ],
    zones: [
      { id: "z1", label: "Северный край", area: 3.2, ndvi: 0.58, risk: "medium", issue: "Неравномерность развития" },
    ],
    aiSummary: [
      "Поле развивается равномерно, NDVI растёт стабильно",
      "Незначительная зона снижения NDVI на северном крае (3.2 га)",
      "Рекомендуется плановое обследование",
    ],
    polygon: [{ x: 50, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 180 }, { x: 50, y: 180 }],
  },
  {
    id: "f2",
    name: "Поле №2",
    crop: "Подсолнечник",
    area: 87.3,
    avgNdvi: 0.52,
    risk: "high",
    lastUpdate: "2026-05-22",
    trend: "down",
    source: "drone",
    history: [
      { date: "01.04", value: 0.38 },
      { date: "15.04", value: 0.61 },
      { date: "01.05", value: 0.64 },
      { date: "15.05", value: 0.58 },
      { date: "22.05", value: 0.52 },
    ],
    zones: [
      { id: "z2", label: "Восточная часть", area: 12.4, ndvi: 0.34, risk: "high", issue: "Возможен дефицит влаги" },
      { id: "z3", label: "Центральная зона", area: 5.8, ndvi: 0.41, risk: "medium", issue: "Признаки стресса растений" },
    ],
    aiSummary: [
      "Обнаружено снижение NDVI на восточной части поля (12.4 га)",
      "Вероятен дефицит влаги — индекс снизился с 0.64 до 0.52 за 3 недели",
      "Рекомендуется обследование участка и локальный полив",
      "Возможен дефицит азота в центральной зоне",
    ],
    polygon: [{ x: 220, y: 50 }, { x: 380, y: 50 }, { x: 380, y: 180 }, { x: 220, y: 180 }],
  },
  {
    id: "f3",
    name: "Поле №3",
    crop: "Кукуруза",
    area: 156.0,
    avgNdvi: 0.65,
    risk: "medium",
    lastUpdate: "2026-05-21",
    trend: "stable",
    source: "landsat",
    history: [
      { date: "01.04", value: 0.45 },
      { date: "15.04", value: 0.58 },
      { date: "01.05", value: 0.66 },
      { date: "15.05", value: 0.65 },
      { date: "22.05", value: 0.65 },
    ],
    zones: [
      { id: "z4", label: "Юго-западная зона", area: 8.1, ndvi: 0.48, risk: "medium", issue: "Снижение активности вегетации" },
    ],
    aiSummary: [
      "Развитие стабильное, но без прироста NDVI за последние 2 недели",
      "Наблюдается ухудшение состояния культуры в юго-западной зоне",
      "Рекомендуется агрохимический анализ почвы",
    ],
    polygon: [{ x: 400, y: 50 }, { x: 550, y: 50 }, { x: 550, y: 180 }, { x: 400, y: 180 }],
  },
  {
    id: "f4",
    name: "Поле №4",
    crop: "Соя",
    area: 92.7,
    avgNdvi: 0.71,
    risk: "low",
    lastUpdate: "2026-05-22",
    trend: "up",
    source: "sentinel-2",
    history: [
      { date: "01.04", value: 0.40 },
      { date: "15.04", value: 0.52 },
      { date: "01.05", value: 0.62 },
      { date: "15.05", value: 0.68 },
      { date: "22.05", value: 0.71 },
    ],
    zones: [],
    aiSummary: [
      "Поле в отличном состоянии",
      "Аномалий не обнаружено",
    ],
    polygon: [{ x: 50, y: 200 }, { x: 200, y: 200 }, { x: 200, y: 350 }, { x: 50, y: 350 }],
  },
];

const initialRecommendations: AiRecommendation[] = [
  {
    id: "r1",
    fieldId: "f2",
    fieldName: "Поле №2",
    operation: "Локальный полив проблемной зоны",
    reason: "Снижение NDVI на восточной части поля — вероятен дефицит влаги",
    risk: "high",
    priority: "Высокий",
    date: "2026-05-22",
  },
  {
    id: "r2",
    fieldId: "f2",
    fieldName: "Поле №2",
    operation: "Дифференцированное внесение удобрений (N)",
    reason: "Признаки возможного дефицита азота в центральной зоне",
    risk: "medium",
    priority: "Средний",
    date: "2026-05-22",
  },
  {
    id: "r3",
    fieldId: "f3",
    fieldName: "Поле №3",
    operation: "Агрохимический анализ почвы",
    reason: "Отсутствие прироста NDVI за 2 недели",
    risk: "medium",
    priority: "Средний",
    date: "2026-05-21",
  },
  {
    id: "r4",
    fieldId: "f1",
    fieldName: "Поле №1",
    operation: "Обследование северной границы",
    reason: "Незначительная зона неравномерного развития",
    risk: "low",
    priority: "Низкий",
    date: "2026-05-22",
  },
];

// Доступные типы агрооперций из модуля «Агро-операции»
const agroOperationTypes = [
  "Посев",
  "Опрыскивание",
  "Полив",
  "Внесение удобрений",
  "Культивация",
  "Боронование",
  "Уборка урожая",
  "Агрохимический анализ почвы",
  "Обследование поля",
];

const dateRange = ["01.04", "15.04", "01.05", "15.05", "22.05"];

// ====== Утилиты ======
const ndviColor = (v: number) => {
  if (v >= 0.7) return "hsl(140 70% 40%)";
  if (v >= 0.55) return "hsl(85 65% 50%)";
  if (v >= 0.4) return "hsl(45 90% 55%)";
  return "hsl(15 80% 55%)";
};

const riskLabel = (r: RiskLevel) => ({ low: "Низкий", medium: "Средний", high: "Высокий" }[r]);
const riskVariant = (r: RiskLevel): "default" | "secondary" | "destructive" =>
  ({ low: "secondary", medium: "default", high: "destructive" } as const)[r];

// ====== Подкомпоненты ======

function StatCard({ icon: Icon, title, value, hint, color }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color || "bg-primary/10"}`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function NdviMap({
  fields,
  dateIdx,
  selectedId,
  onSelect,
  showHeatmap = true,
}: {
  fields: Field[];
  dateIdx: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
  showHeatmap?: boolean;
}) {
  return (
    <div className="relative w-full h-[420px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-border">
      <svg viewBox="0 0 600 400" className="w-full h-full">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(0 0% 100% / 0.05)" strokeWidth="1" />
          </pattern>
          <radialGradient id="hot-high" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(15 90% 55% / 0.7)" />
            <stop offset="100%" stopColor="hsl(15 90% 55% / 0)" />
          </radialGradient>
          <radialGradient id="hot-med" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(45 90% 55% / 0.6)" />
            <stop offset="100%" stopColor="hsl(45 90% 55% / 0)" />
          </radialGradient>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />

        {fields.map((f) => {
          const pts = f.polygon.map((p) => `${p.x},${p.y}`).join(" ");
          const center = {
            x: f.polygon.reduce((a, p) => a + p.x, 0) / f.polygon.length,
            y: f.polygon.reduce((a, p) => a + p.y, 0) / f.polygon.length,
          };
          const ndviAtDate = f.history[Math.min(dateIdx, f.history.length - 1)]?.value || f.avgNdvi;
          const fill = showHeatmap ? ndviColor(ndviAtDate) : "hsl(140 30% 30%)";
          const isSel = selectedId === f.id;
          return (
            <g key={f.id} className="cursor-pointer" onClick={() => onSelect?.(f.id)}>
              <polygon
                points={pts}
                fill={fill}
                fillOpacity={showHeatmap ? 0.55 : 0.3}
                stroke={isSel ? "hsl(var(--primary))" : "hsl(0 0% 100% / 0.5)"}
                strokeWidth={isSel ? 3 : 1.5}
              />
              {showHeatmap &&
                f.zones.map((z, i) => (
                  <circle
                    key={z.id}
                    cx={center.x + (i % 2 === 0 ? -25 : 25)}
                    cy={center.y + (i % 2 === 0 ? -15 : 15)}
                    r={20 + z.area * 0.6}
                    fill={`url(#hot-${z.risk === "high" ? "high" : "med"})`}
                  />
                ))}
              <text x={center.x} y={center.y - 4} textAnchor="middle" className="fill-white text-xs font-semibold">
                {f.name}
              </text>
              <text x={center.x} y={center.y + 12} textAnchor="middle" className="fill-white/90 text-[10px]">
                NDVI {ndviAtDate.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Легенда */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-1.5">
        <div className="font-semibold mb-1 flex items-center gap-1"><Layers className="h-3 w-3" /> NDVI</div>
        <div className="flex items-center gap-2"><div className="w-4 h-3 rounded" style={{ background: ndviColor(0.8) }} />0.7 — 1.0 отлично</div>
        <div className="flex items-center gap-2"><div className="w-4 h-3 rounded" style={{ background: ndviColor(0.6) }} />0.55 — 0.7 хорошо</div>
        <div className="flex items-center gap-2"><div className="w-4 h-3 rounded" style={{ background: ndviColor(0.45) }} />0.4 — 0.55 стресс</div>
        <div className="flex items-center gap-2"><div className="w-4 h-3 rounded" style={{ background: ndviColor(0.3) }} />&lt; 0.4 риск</div>
      </div>

      {/* Дата */}
      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-2">
        <Calendar className="h-3 w-3 text-primary" />
        {dateRange[dateIdx]} 2026
      </div>
    </div>
  );
}

function NdviChart({ data }: { data: NdviPoint[] }) {
  const w = 500, h = 160, pad = 30;
  const min = 0.2, max = 1;
  const xStep = (w - pad * 2) / (data.length - 1);
  const yFor = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const points = data.map((d, i) => `${pad + i * xStep},${yFor(d.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0.3, 0.5, 0.7, 0.9].map((v) => (
        <g key={v}>
          <line x1={pad} y1={yFor(v)} x2={w - pad} y2={yFor(v)} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <text x={4} y={yFor(v) + 3} className="fill-muted-foreground text-[10px]">{v}</text>
        </g>
      ))}
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={pad + i * xStep} cy={yFor(d.value)} r="4" fill={ndviColor(d.value)} stroke="white" strokeWidth="1.5" />
          <text x={pad + i * xStep} y={h - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{d.date}</text>
        </g>
      ))}
    </svg>
  );
}

// ====== Главный компонент ======
export default function NdviMonitoring() {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>(initialRecommendations);
  const [dateIdx, setDateIdx] = useState(dateRange.length - 1);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("f2");
  const [uploads, setUploads] = useState<DroneUpload[]>([
    { id: "u1", name: "field2_orthomosaic_2026-05-22.tif", type: "GeoTIFF", size: "284 МБ", status: "ready", progress: 100, date: "2026-05-22", avgNdvi: 0.52 },
    { id: "u2", name: "field3_ndvi.shp", type: "Shapefile", size: "12 МБ", status: "ready", progress: 100, date: "2026-05-21", avgNdvi: 0.65 },
  ]);
  const [compareMode, setCompareMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [acceptDialog, setAcceptDialog] = useState<AiRecommendation | null>(null);
  const [assignTo, setAssignTo] = useState("Иванов И.И.");
  const [deadline, setDeadline] = useState("2026-05-29");
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];
  const avgNdvi = (fields.reduce((s, f) => s + f.avgNdvi, 0) / fields.length).toFixed(2);
  const problemFields = fields.filter((f) => f.risk !== "low").length;
  const anomalies = fields.reduce((s, f) => s + f.zones.length, 0);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const id = "u" + Date.now() + Math.random();
      const type = file.name.endsWith(".shp") ? "Shapefile" :
                   file.name.endsWith(".geojson") ? "GeoJSON" :
                   file.name.match(/\.tiff?$/i) ? "GeoTIFF" : "Raster";
      const newU: DroneUpload = {
        id, name: file.name, type, size: (file.size / 1024 / 1024).toFixed(1) + " МБ",
        status: "processing", progress: 0, date: new Date().toISOString().slice(0, 10),
      };
      setUploads((p) => [newU, ...p]);

      // Симуляция обработки
      let prog = 0;
      const iv = setInterval(() => {
        prog += 15 + Math.random() * 15;
        setUploads((p) => p.map((u) => u.id === id ? { ...u, progress: Math.min(prog, 100) } : u));
        if (prog >= 100) {
          clearInterval(iv);
          const ndvi = +(0.4 + Math.random() * 0.4).toFixed(2);
          setUploads((p) => p.map((u) => u.id === id ? { ...u, status: "ready", progress: 100, avgNdvi: ndvi } : u));
          toast.success(`Файл обработан: ${file.name}`, { description: `Средний NDVI: ${ndvi}` });
        }
      }, 400);
    });
  };

  const acceptRecommendation = () => {
    if (!acceptDialog) return;
    setRecommendations((p) => p.map((r) => r.id === acceptDialog.id ? { ...r, accepted: true } : r));
    toast.success("Агрооперация создана", {
      description: `${acceptDialog.operation} → ${acceptDialog.fieldName}. Ответственный: ${assignTo}, срок: ${deadline}`,
    });
    setAcceptDialog(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Satellite className="h-7 w-7 text-primary" />
              NDVI-мониторинг
            </h1>
            <p className="text-muted-foreground mt-1">
              Спутниковая и дрон-аналитика состояния полей с AI-рекомендациями
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1"><Satellite className="h-3 w-3" /> Sentinel-2</Badge>
            <Badge variant="outline" className="gap-1"><Satellite className="h-3 w-3" /> Landsat</Badge>
            <Badge variant="outline" className="gap-1"><Plane className="h-3 w-3" /> Дроны</Badge>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="map">Карта</TabsTrigger>
            <TabsTrigger value="fields">Поля</TabsTrigger>
            <TabsTrigger value="field">Карточка</TabsTrigger>
            <TabsTrigger value="upload">Загрузка</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          {/* === Dashboard === */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Leaf} title="Средний NDVI" value={avgNdvi} hint="По всем полям" color="bg-primary/10" />
              <StatCard icon={AlertTriangle} title="Проблемные поля" value={problemFields} hint={`из ${fields.length} активных`} color="bg-destructive/10" />
              <StatCard icon={Brain} title="AI-аномалии" value={anomalies} hint="Зон риска обнаружено" color="bg-accent/10" />
              <StatCard icon={Sparkles} title="Рекомендации" value={recommendations.filter(r => !r.accepted).length} hint="Ожидают решения" color="bg-primary/10" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapIcon className="h-5 w-5 text-primary" /> Состояние полей</CardTitle>
                </CardHeader>
                <CardContent>
                  <NdviMap fields={fields} dateIdx={dateIdx} selectedId={selectedFieldId} onSelect={setSelectedFieldId} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Последние AI-рекомендации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendations.slice(0, 4).map((r) => (
                    <div key={r.id} className="border border-border rounded-lg p-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">{r.operation}</div>
                        <Badge variant={riskVariant(r.risk)} className="shrink-0">{r.priority}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{r.fieldName}</div>
                      <div className="text-xs mt-1">{r.reason}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === Карта мониторинга === */}
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2"><MapIcon className="h-5 w-5 text-primary" /> Карта NDVI-мониторинга</CardTitle>
                  <div className="flex gap-2">
                    <Button variant={showHeatmap ? "default" : "outline"} size="sm" onClick={() => setShowHeatmap((v) => !v)}>
                      <Layers className="h-3 w-3 mr-1" /> Heatmap
                    </Button>
                    <Button variant={compareMode ? "default" : "outline"} size="sm" onClick={() => setCompareMode((v) => !v)}>
                      Сравнение
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {compareMode ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Снимок А: {dateRange[0]}</div>
                      <NdviMap fields={fields} dateIdx={0} showHeatmap={showHeatmap} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Снимок Б: {dateRange[dateIdx]}</div>
                      <NdviMap fields={fields} dateIdx={dateIdx} showHeatmap={showHeatmap} />
                    </div>
                  </div>
                ) : (
                  <NdviMap fields={fields} dateIdx={dateIdx} selectedId={selectedFieldId} onSelect={setSelectedFieldId} showHeatmap={showHeatmap} />
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Label className="flex items-center gap-2"><Calendar className="h-3 w-3" /> Временной слайдер</Label>
                    <span className="font-medium">{dateRange[dateIdx]} 2026</span>
                  </div>
                  <Slider value={[dateIdx]} min={0} max={dateRange.length - 1} step={1} onValueChange={(v) => setDateIdx(v[0])} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {dateRange.map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Список полей === */}
          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Поля под мониторингом</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Поле</TableHead>
                      <TableHead>Культура</TableHead>
                      <TableHead>Площадь, га</TableHead>
                      <TableHead>NDVI</TableHead>
                      <TableHead>Динамика</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead>Обновлено</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((f) => (
                      <TableRow key={f.id} className="cursor-pointer" onClick={() => setSelectedFieldId(f.id)}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.crop}</TableCell>
                        <TableCell>{f.area}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2">
                            <span className="w-3 h-3 rounded" style={{ background: ndviColor(f.avgNdvi) }} />
                            {f.avgNdvi.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {f.trend === "up" && <TrendingUp className="h-4 w-4 text-primary" />}
                          {f.trend === "down" && <TrendingDown className="h-4 w-4 text-destructive" />}
                          {f.trend === "stable" && <Activity className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell><Badge variant={riskVariant(f.risk)}>{riskLabel(f.risk)}</Badge></TableCell>
                        <TableCell className="text-xs">{f.source}</TableCell>
                        <TableCell className="text-xs">{f.lastUpdate}</TableCell>
                        <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Карточка поля === */}
          <TabsContent value="field" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>{selectedField.name} — {selectedField.crop}</CardTitle>
                    <CardDescription>{selectedField.area} га · обновлено {selectedField.lastUpdate} · источник: {selectedField.source}</CardDescription>
                  </div>
                  <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
                    <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <StatCard icon={Leaf} title="Средний NDVI" value={selectedField.avgNdvi.toFixed(2)} hint={selectedField.trend === "up" ? "↑ растёт" : selectedField.trend === "down" ? "↓ снижается" : "стабильно"} />
              <StatCard icon={AlertTriangle} title="Проблемных зон" value={selectedField.zones.length} hint={`${selectedField.zones.reduce((s, z) => s + z.area, 0).toFixed(1)} га`} />
              <StatCard icon={Target} title="Уровень риска" value={riskLabel(selectedField.risk)} hint="По AI-оценке" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">История NDVI</CardTitle></CardHeader>
                <CardContent><NdviChart data={selectedField.history} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapIcon className="h-4 w-4 text-primary" /> Карта проблемных зон</CardTitle></CardHeader>
                <CardContent><NdviMap fields={[selectedField]} dateIdx={dateIdx} /></CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI-анализ</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedField.aiSummary.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedField.zones.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">ЗОНЫ РИСКА</div>
                      {selectedField.zones.map((z) => (
                        <div key={z.id} className="flex items-center justify-between border border-border rounded p-2 text-sm">
                          <div>
                            <div className="font-medium">{z.label}</div>
                            <div className="text-xs text-muted-foreground">{z.issue} · {z.area} га · NDVI {z.ndvi}</div>
                          </div>
                          <Badge variant={riskVariant(z.risk)}>{riskLabel(z.risk)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cog className="h-4 w-4 text-primary" /> Рекомендуемые агрооперации</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.filter((r) => r.fieldId === selectedField.id).map((r) => (
                    <div key={r.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-sm">{r.operation}</div>
                        <Badge variant={riskVariant(r.risk)}>{r.priority}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{r.reason}</div>
                      <div className="flex justify-end mt-2">
                        {r.accepted ? (
                          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Принято</Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setAcceptDialog(r)}>Принять → Агрооперация</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {recommendations.filter((r) => r.fieldId === selectedField.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">Рекомендаций нет — поле в норме.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* === Загрузка данных с дронов === */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /> Загрузка данных с дронов</CardTitle>
                <CardDescription>GeoTIFF · TIFF · orthomosaic · NDVI raster · SHP · GeoJSON</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-10 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                >
                  <FileUp className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-medium">Перетащите файлы сюда или нажмите для выбора</div>
                  <div className="text-xs text-muted-foreground mt-1">.tif, .tiff, .shp, .geojson — до 500 МБ</div>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".tif,.tiff,.shp,.geojson"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">История загрузок</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {uploads.map((u) => (
                  <div key={u.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 min-w-0">
                        <FileImage className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.type} · {u.size} · {u.date}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {u.status === "ready" ? (
                          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> NDVI {u.avgNdvi}</Badge>
                        ) : (
                          <Badge variant="outline">Обработка</Badge>
                        )}
                      </div>
                    </div>
                    {u.status === "processing" && (
                      <Progress value={u.progress} className="mt-2 h-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === AI-рекомендации === */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> AI-рекомендации</CardTitle>
                <CardDescription>Обнаруженные проблемы и предложенные агрооперации</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Поле</TableHead>
                      <TableHead>Операция</TableHead>
                      <TableHead>Причина</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Приоритет</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.fieldName}</TableCell>
                        <TableCell>{r.operation}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs">{r.reason}</TableCell>
                        <TableCell><Badge variant={riskVariant(r.risk)}>{riskLabel(r.risk)}</Badge></TableCell>
                        <TableCell>{r.priority}</TableCell>
                        <TableCell className="text-xs">{r.date}</TableCell>
                        <TableCell>
                          {r.accepted ? (
                            <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Принято</Badge>
                          ) : (
                            <Button size="sm" onClick={() => setAcceptDialog(r)}>Принять</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Диалог принятия рекомендации */}
        <Dialog open={!!acceptDialog} onOpenChange={(o) => !o && setAcceptDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать агрооперацию</DialogTitle>
              <DialogDescription>На основе AI-рекомендации</DialogDescription>
            </DialogHeader>
            {acceptDialog && (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="font-medium">{acceptDialog.operation}</div>
                  <div className="text-xs text-muted-foreground mt-1">{acceptDialog.fieldName} · {acceptDialog.reason}</div>
                </div>
                <div>
                  <Label>Ответственный</Label>
                  <Input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
                </div>
                <div>
                  <Label>Срок выполнения</Label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
                <div>
                  <Label>Комментарий</Label>
                  <Textarea placeholder="Дополнительные указания..." />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAcceptDialog(null)}>Отмена</Button>
              <Button onClick={acceptRecommendation}>Создать агрооперацию</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
