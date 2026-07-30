import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Warehouse,
  Plus,
  Thermometer,
  Droplets,
  Trash2,
  Upload,
  FlaskConical,
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  Download,
} from "lucide-react";

type FeedType =
  | "Сено"
  | "Силос"
  | "Сенаж"
  | "Зерно"
  | "Комбикорм"
  | "Жмых"
  | "Солома";

const FEED_TYPES: FeedType[] = [
  "Сено",
  "Силос",
  "Сенаж",
  "Зерно",
  "Комбикорм",
  "Жмых",
  "Солома",
];

interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
}

interface ChemRow {
  id: string;
  sample: string;
  date: string;
  dryMatter: number | null;
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  ash: number | null;
  starch: number | null;
  sugar: number | null;
  energy: number | null;
}

interface StorageObject {
  id: number;
  name: string;
  location: string;
  feedType: FeedType;
  volume: number;
  capacity: number;
  unit: string;
  note: string;
  sensors: SensorReading[];
  chem: ChemRow[];
}

const now = Date.now();
const mkSensors = (baseT: number, baseH: number): SensorReading[] =>
  Array.from({ length: 8 }, (_, i) => ({
    timestamp: new Date(now - i * 3600000).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: Math.round((baseT + (Math.random() * 3 - 1.5)) * 10) / 10,
    humidity: Math.round(baseH + (Math.random() * 8 - 4)),
  }));

const initialObjects: StorageObject[] = [
  {
    id: 1,
    name: "Склад №1 — Сенохранилище",
    location: "База, сектор А",
    feedType: "Сено",
    volume: 420,
    capacity: 600,
    unit: "т",
    note: "Напольное хранение, рулоны",
    sensors: mkSensors(14, 62),
    chem: [
      {
        id: "c1",
        sample: "Партия 04/25",
        date: "12.04.2026",
        dryMatter: 85.2,
        protein: 12.4,
        fat: 2.1,
        fiber: 28.6,
        ash: 7.3,
        starch: 1.2,
        sugar: 6.8,
        energy: 8.6,
      },
    ],
  },
  {
    id: 2,
    name: "Траншея силосная №2",
    location: "Ферма КРС",
    feedType: "Силос",
    volume: 1150,
    capacity: 1400,
    unit: "т",
    note: "Кукурузный силос, укрыт плёнкой",
    sensors: mkSensors(22, 78),
    chem: [],
  },
  {
    id: 3,
    name: "Зерносклад №3",
    location: "Элеватор",
    feedType: "Зерно",
    volume: 780,
    capacity: 900,
    unit: "т",
    note: "Пшеница фуражная",
    sensors: mkSensors(11, 55),
    chem: [],
  },
];

const CHEM_FIELDS: { key: keyof ChemRow; label: string; aliases: string[] }[] = [
  { key: "dryMatter", label: "Сухое вещество, %", aliases: ["сухое вещество", "св", "dry matter", "dm"] },
  { key: "protein", label: "Сырой протеин, %", aliases: ["протеин", "сырой протеин", "protein", "cp"] },
  { key: "fat", label: "Сырой жир, %", aliases: ["жир", "сырой жир", "fat"] },
  { key: "fiber", label: "Клетчатка, %", aliases: ["клетчатка", "сырая клетчатка", "fiber", "fibre"] },
  { key: "ash", label: "Зола, %", aliases: ["зола", "ash"] },
  { key: "starch", label: "Крахмал, %", aliases: ["крахмал", "starch"] },
  { key: "sugar", label: "Сахар, %", aliases: ["сахар", "sugar"] },
  { key: "energy", label: "ОЭ, МДж/кг", aliases: ["оэ", "энергия", "обменная энергия", "energy", "me"] },
];

const norm = (s: string) => s.toString().trim().toLowerCase().replace(/[.,%]/g, "").trim();

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

function statusOf(obj: StorageObject) {
  const last = obj.sensors[0];
  if (!last) return { label: "Нет данных", tone: "secondary" as const };
  const hot = last.temperature > 25;
  const wet = last.humidity > 80;
  if (hot || wet) return { label: "Внимание", tone: "destructive" as const };
  return { label: "Норма", tone: "default" as const };
}

export default function Storage() {
  const [objects, setObjects] = useState<StorageObject[]>(initialObjects);
  const [selectedId, setSelectedId] = useState<number>(initialObjects[0].id);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    feedType: "Сено" as FeedType,
    volume: "",
    capacity: "",
    unit: "т",
    note: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => objects.find((o) => o.id === selectedId) ?? objects[0],
    [objects, selectedId]
  );

  const totals = useMemo(() => {
    const volume = objects.reduce((s, o) => s + o.volume, 0);
    const capacity = objects.reduce((s, o) => s + o.capacity, 0);
    const alerts = objects.filter((o) => statusOf(o).tone === "destructive").length;
    return { volume, capacity, alerts };
  }, [objects]);

  const handleAdd = () => {
    if (!form.name.trim()) {
      toast.error("Укажите название объекта хранения");
      return;
    }
    const volume = Number(form.volume) || 0;
    const capacity = Number(form.capacity) || 0;
    if (capacity && volume > capacity) {
      toast.error("Объем хранения превышает вместимость");
      return;
    }
    const obj: StorageObject = {
      id: Date.now(),
      name: form.name.trim(),
      location: form.location.trim(),
      feedType: form.feedType,
      volume,
      capacity: capacity || volume,
      unit: form.unit,
      note: form.note.trim(),
      sensors: mkSensors(15, 60),
      chem: [],
    };
    setObjects((p) => [...p, obj]);
    setSelectedId(obj.id);
    setForm({ name: "", location: "", feedType: "Сено", volume: "", capacity: "", unit: "т", note: "" });
    setAddOpen(false);
    toast.success("Объект хранения добавлен");
  };

  const handleRemove = (id: number) => {
    setObjects((p) => p.filter((o) => o.id !== id));
    if (selectedId === id) {
      const rest = objects.filter((o) => o.id !== id);
      if (rest[0]) setSelectedId(rest[0].id);
    }
    toast.success("Объект удалён");
  };

  const handleImport = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        toast.error("В файле нет листов с данными");
        return;
      }
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      if (!rows.length) {
        toast.error("Файл пустой — нет строк для импорта");
        return;
      }
      const headers = Object.keys(rows[0]);
      const map = new Map<keyof ChemRow, string>();
      CHEM_FIELDS.forEach((f) => {
        const h = headers.find((x) => f.aliases.some((a) => norm(x).includes(a)));
        if (h) map.set(f.key, h);
      });
      if (map.size === 0) {
        toast.error(
          "Не найдено ни одной колонки химсостава. Ожидаются: протеин, жир, клетчатка, зола, крахмал, сахар, сухое вещество, ОЭ"
        );
        return;
      }
      const sampleCol = headers.find((h) => /проба|образ|партия|sample/i.test(h));
      const dateCol = headers.find((h) => /дата|date/i.test(h));

      const parsed: ChemRow[] = rows.map((r, i) => {
        const row: ChemRow = {
          id: `${Date.now()}-${i}`,
          sample: sampleCol ? String(r[sampleCol] || `Строка ${i + 1}`) : `Строка ${i + 1}`,
          date: dateCol ? String(r[dateCol] || "") : new Date().toLocaleDateString("ru-RU"),
          dryMatter: null,
          protein: null,
          fat: null,
          fiber: null,
          ash: null,
          starch: null,
          sugar: null,
          energy: null,
        };
        map.forEach((col, key) => {
          (row[key] as number | null) = toNum(r[col]);
        });
        return row;
      });

      setObjects((p) =>
        p.map((o) => (o.id === selected.id ? { ...o, chem: [...parsed, ...o.chem] } : o))
      );
      toast.success(
        `Импортировано ${parsed.length} строк, распознано ${map.size} показателей`
      );
    } catch {
      toast.error("Не удалось прочитать файл. Поддерживаются .xlsx, .xls и .csv");
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Проба", "Дата", ...CHEM_FIELDS.map((f) => f.label)],
      ["Партия 01/26", "01.05.2026", 88, 13.5, 2.4, 26.1, 6.9, 3.2, 5.5, 9.1],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Химсостав");
    XLSX.writeFile(wb, "shablon-himsostav.xlsx");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Warehouse className="h-8 w-8 text-primary" />
              Хранение кормов
            </h1>
            <p className="text-muted-foreground">
              Объекты хранения, датчики микроклимата и химический состав кормов
            </p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Добавить объект
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый объект хранения</DialogTitle>
                <DialogDescription>
                  Укажите тип хранимых кормов и объем хранения
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    placeholder="Например: Склад №4"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Расположение</Label>
                  <Input
                    placeholder="Например: Ферма КРС"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Тип хранимых кормов</Label>
                  <Select
                    value={form.feedType}
                    onValueChange={(v) => setForm((p) => ({ ...p, feedType: v as FeedType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEED_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Объем</Label>
                    <Input
                      type="number"
                      value={form.volume}
                      onChange={(e) => setForm((p) => ({ ...p, volume: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Вместимость</Label>
                    <Input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Ед. изм.</Label>
                    <Select
                      value={form.unit}
                      onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="т">т</SelectItem>
                        <SelectItem value="кг">кг</SelectItem>
                        <SelectItem value="м³">м³</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Примечание</Label>
                  <Textarea
                    rows={2}
                    value={form.note}
                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
                <Button className="w-full" onClick={handleAdd}>
                  Добавить объект
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" /> Объектов хранения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{objects.length}</span>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-muted-foreground" /> Всего кормов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{totals.volume.toLocaleString("ru-RU")}</span>
              <span className="text-sm text-muted-foreground ml-2">
                из {totals.capacity.toLocaleString("ru-RU")} т
              </span>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" /> Отклонения микроклимата
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{totals.alerts}</span>
              <span className="text-sm text-muted-foreground ml-2">объектов</span>
            </CardContent>
          </Card>
        </div>

        {/* Objects list */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {objects.map((o) => {
            const st = statusOf(o);
            const last = o.sensors[0];
            const fill = o.capacity ? Math.min(100, Math.round((o.volume / o.capacity) * 100)) : 0;
            return (
              <Card
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`border-border cursor-pointer transition-all hover:shadow-lg ${
                  o.id === selected?.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{o.name}</CardTitle>
                      <CardDescription>{o.location || "—"}</CardDescription>
                    </div>
                    <Badge variant={st.tone}>{st.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="secondary">{o.feedType}</Badge>
                    <span className="font-medium">
                      {o.volume.toLocaleString("ru-RU")} / {o.capacity.toLocaleString("ru-RU")} {o.unit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${fill}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4" /> {last ? `${last.temperature} °C` : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" /> {last ? `${last.humidity} %` : "—"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(o.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Details */}
        {selected && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">{selected.name}</CardTitle>
              <CardDescription>
                {selected.feedType} · {selected.volume.toLocaleString("ru-RU")} {selected.unit}
                {selected.note ? ` · ${selected.note}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sensors">
                <TabsList>
                  <TabsTrigger value="sensors">Датчики</TabsTrigger>
                  <TabsTrigger value="chem">Химический состав</TabsTrigger>
                </TabsList>

                <TabsContent value="sensors" className="pt-4">
                  <div className="rounded-md border border-border overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Время</TableHead>
                          <TableHead>Температура, °C</TableHead>
                          <TableHead>Влажность, %</TableHead>
                          <TableHead>Состояние</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.sensors.map((s, i) => {
                          const bad = s.temperature > 25 || s.humidity > 80;
                          return (
                            <TableRow key={i}>
                              <TableCell className="text-muted-foreground">{s.timestamp}</TableCell>
                              <TableCell>{s.temperature}</TableCell>
                              <TableCell>{s.humidity}</TableCell>
                              <TableCell>
                                <Badge variant={bad ? "destructive" : "secondary"}>
                                  {bad ? "Отклонение" : "Норма"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="chem" className="pt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImport(f);
                        e.target.value = "";
                      }}
                    />
                    <Button onClick={() => fileRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-1" />
                      Импорт из Excel
                    </Button>
                    <Button variant="outline" onClick={downloadTemplate}>
                      <Download className="h-4 w-4 mr-1" />
                      Скачать шаблон
                    </Button>
                    {selected.chem.length > 0 && (
                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setObjects((p) =>
                            p.map((o) => (o.id === selected.id ? { ...o, chem: [] } : o))
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Очистить
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Колонки распознаются автоматически: проба, дата, сухое вещество, протеин, жир,
                    клетчатка, зола, крахмал, сахар, ОЭ.
                  </p>

                  {selected.chem.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg">
                      <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Данные по химическому составу не загружены
                    </div>
                  ) : (
                    <div className="rounded-md border border-border overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[140px]">Проба</TableHead>
                            <TableHead className="min-w-[110px]">Дата</TableHead>
                            {CHEM_FIELDS.map((f) => (
                              <TableHead key={f.key} className="min-w-[110px]">
                                {f.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selected.chem.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-medium">{row.sample}</TableCell>
                              <TableCell className="text-muted-foreground">{row.date}</TableCell>
                              {CHEM_FIELDS.map((f) => (
                                <TableCell key={f.key}>
                                  {row[f.key] === null ? "—" : String(row[f.key])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
