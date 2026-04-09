import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Trash2, Save, History, AlertTriangle, ChevronDown, ChevronUp, Settings, Plus, X } from "lucide-react";

interface CropRemovalRates {
  N: string;
  P2O5: string;
  K2O: string;
}

interface CropConfig {
  id: string;
  name: string;
  depths: string[];
  removal: CropRemovalRates;
}

const DEFAULT_CROPS: CropConfig[] = [
  { id: "wheat", name: "Пшеница озимая", depths: ["3-4 см", "4-5 см", "5-6 см"], removal: { N: "30", P2O5: "12", K2O: "25" } },
  { id: "wheat-spring", name: "Пшеница яровая", depths: ["3-4 см", "4-5 см", "5-6 см"], removal: { N: "35", P2O5: "12", K2O: "26" } },
  { id: "corn", name: "Кукуруза", depths: ["5-6 см", "6-8 см", "8-10 см"], removal: { N: "34", P2O5: "12", K2O: "37" } },
  { id: "sunflower", name: "Подсолнечник", depths: ["5-6 см", "6-8 см", "8-10 см"], removal: { N: "60", P2O5: "26", K2O: "180" } },
  { id: "barley", name: "Ячмень", depths: ["3-4 см", "4-5 см", "5-6 см"], removal: { N: "25", P2O5: "11", K2O: "24" } },
  { id: "soybean", name: "Соя", depths: ["3-4 см", "4-6 см", "6-8 см"], removal: { N: "72", P2O5: "16", K2O: "25" } },
  { id: "rapeseed", name: "Рапс", depths: ["1-2 см", "2-3 см", "3-4 см"], removal: { N: "50", P2O5: "23", K2O: "35" } },
];

interface ElementInputs {
  yield: string;
  removalPerTon: string;
  soilContent: string;
  soilCoeff: string;
  organicInput: string;
  mineralCoeff: string;
}

interface ElementResult {
  totalNeed: number;
  fromSoil: number;
  fromOrganic: number;
  deficit: number;
  activeDose: number;
}

interface CalculationRecord {
  id: string;
  date: string;
  user: string;
  crop: string;
  depth: string;
  inputs: { N: ElementInputs; P2O5: ElementInputs; K2O: ElementInputs };
  results: { N: ElementResult; P2O5: ElementResult; K2O: ElementResult };
}

const ELEMENTS = ["N", "P2O5", "K2O"] as const;
type Element = (typeof ELEMENTS)[number];

const ELEMENT_LABELS: Record<Element, string> = {
  N: "Азот (N)",
  P2O5: "Фосфор (P₂O₅)",
  K2O: "Калий (K₂O)",
};

const ELEMENT_COLORS: Record<Element, string> = {
  N: "bg-chart-1/10 border-chart-1/30",
  P2O5: "bg-chart-2/10 border-chart-2/30",
  K2O: "bg-chart-3/10 border-chart-3/30",
};

const ELEMENT_BADGE: Record<Element, string> = {
  N: "bg-chart-1 text-primary-foreground",
  P2O5: "bg-chart-2 text-primary-foreground",
  K2O: "bg-chart-3 text-primary-foreground",
};

const defaultInputs = (): ElementInputs => ({
  yield: "",
  removalPerTon: "",
  soilContent: "",
  soilCoeff: "",
  organicInput: "",
  mineralCoeff: "",
});

const FIELDS: { key: keyof ElementInputs; label: string; unit: string; isCoeff?: boolean; autoFill?: boolean }[] = [
  { key: "yield", label: "Планируемая урожайность", unit: "т/га" },
  { key: "removalPerTon", label: "Вынос на 1 т урожая", unit: "кг/т", autoFill: true },
  { key: "soilContent", label: "Содержание в почве", unit: "кг/га" },
  { key: "soilCoeff", label: "Коэф. использования из почвы", unit: "доля (0–1)", isCoeff: true },
  { key: "organicInput", label: "Поступление с органикой", unit: "кг/га" },
  { key: "mineralCoeff", label: "Коэф. использования из мин. удобрения", unit: "доля (0–1)", isCoeff: true },
];

export default function FertilizerCalculator() {
  const { toast } = useToast();
  const [crops, setCrops] = useState<CropConfig[]>(DEFAULT_CROPS);
  const [selectedCropId, setSelectedCropId] = useState<string>("");
  const [selectedDepth, setSelectedDepth] = useState<string>("");
  const [inputs, setInputs] = useState<Record<Element, ElementInputs>>({
    N: defaultInputs(), P2O5: defaultInputs(), K2O: defaultInputs(),
  });
  const [results, setResults] = useState<Record<Element, ElementResult> | null>(null);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expandedElements, setExpandedElements] = useState<Record<Element, boolean>>({
    N: true, P2O5: true, K2O: true,
  });
  const [userName, setUserName] = useState("Агроном");

  // Settings state
  const [editingCrop, setEditingCrop] = useState<CropConfig | null>(null);
  const [newCropName, setNewCropName] = useState("");
  const [newCropDepths, setNewCropDepths] = useState("3-4 см, 4-5 см, 5-6 см");
  const [newCropRemoval, setNewCropRemoval] = useState<CropRemovalRates>({ N: "", P2O5: "", K2O: "" });

  const selectedCrop = crops.find((c) => c.id === selectedCropId);

  const handleCropChange = (cropId: string) => {
    setSelectedCropId(cropId);
    setSelectedDepth("");
    const crop = crops.find((c) => c.id === cropId);
    if (crop) {
      setInputs((prev) => ({
        N: { ...prev.N, removalPerTon: crop.removal.N },
        P2O5: { ...prev.P2O5, removalPerTon: crop.removal.P2O5 },
        K2O: { ...prev.K2O, removalPerTon: crop.removal.K2O },
      }));
    }
    setResults(null);
  };

  const handleInputChange = (element: Element, key: keyof ElementInputs, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setInputs((prev) => ({
      ...prev,
      [element]: { ...prev[element], [key]: value },
    }));
    setResults(null);
  };

  const validate = (): string | null => {
    if (!selectedCropId) return "Выберите культуру";
    if (!selectedDepth) return "Выберите глубину посадки";
    for (const el of ELEMENTS) {
      const inp = inputs[el];
      for (const f of FIELDS) {
        const v = inp[f.key];
        if (v === "") return `${ELEMENT_LABELS[el]}: заполните поле «${f.label}»`;
        const num = parseFloat(v);
        if (isNaN(num) || num < 0) return `${ELEMENT_LABELS[el]}: «${f.label}» должно быть ≥ 0`;
        if (f.isCoeff && (num < 0 || num > 1)) return `${ELEMENT_LABELS[el]}: «${f.label}» должно быть от 0 до 1`;
      }
      if (parseFloat(inp.mineralCoeff) === 0)
        return `${ELEMENT_LABELS[el]}: коэф. использования из мин. удобрения не может быть 0`;
    }
    return null;
  };

  const calculate = () => {
    const error = validate();
    if (error) {
      toast({ title: "Ошибка ввода", description: error, variant: "destructive" });
      return;
    }
    const res = {} as Record<Element, ElementResult>;
    for (const el of ELEMENTS) {
      const i = inputs[el];
      const yld = parseFloat(i.yield);
      const removal = parseFloat(i.removalPerTon);
      const soilContent = parseFloat(i.soilContent);
      const soilCoeff = parseFloat(i.soilCoeff);
      const orgInput = parseFloat(i.organicInput);
      const minCoeff = parseFloat(i.mineralCoeff);

      const totalNeed = yld * removal;
      const fromSoil = soilContent * soilCoeff;
      const fromOrganic = orgInput;
      const deficit = Math.max(0, totalNeed - fromSoil - fromOrganic);
      const activeDose = deficit / minCoeff;

      res[el] = { totalNeed, fromSoil, fromOrganic, deficit, activeDose };
    }
    setResults(res);
  };

  const clearAll = () => {
    setSelectedCropId("");
    setSelectedDepth("");
    setInputs({ N: defaultInputs(), P2O5: defaultInputs(), K2O: defaultInputs() });
    setResults(null);
  };

  const saveCalculation = () => {
    if (!results) return;
    const record: CalculationRecord = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString("ru-RU"),
      user: userName,
      crop: selectedCrop?.name || "",
      depth: selectedDepth,
      inputs: JSON.parse(JSON.stringify(inputs)),
      results: JSON.parse(JSON.stringify(results)),
    };
    setHistory((prev) => [record, ...prev]);
    toast({ title: "Сохранено", description: "Расчет добавлен в историю" });
  };

  const loadFromHistory = (record: CalculationRecord) => {
    const crop = crops.find((c) => c.name === record.crop);
    if (crop) {
      setSelectedCropId(crop.id);
      setSelectedDepth(record.depth);
    }
    setInputs(JSON.parse(JSON.stringify(record.inputs)));
    setResults(JSON.parse(JSON.stringify(record.results)));
    setHistoryOpen(false);
  };

  const fmt = (n: number) => n.toFixed(2);
  const toggleElement = (el: Element) =>
    setExpandedElements((prev) => ({ ...prev, [el]: !prev[el] }));

  // Settings handlers
  const handleSaveCropSettings = (crop: CropConfig) => {
    setCrops((prev) => prev.map((c) => (c.id === crop.id ? crop : c)));
    if (selectedCropId === crop.id) {
      setInputs((prev) => ({
        N: { ...prev.N, removalPerTon: crop.removal.N },
        P2O5: { ...prev.P2O5, removalPerTon: crop.removal.P2O5 },
        K2O: { ...prev.K2O, removalPerTon: crop.removal.K2O },
      }));
    }
    setEditingCrop(null);
    toast({ title: "Сохранено", description: `Параметры «${crop.name}» обновлены` });
  };

  const handleAddCrop = () => {
    if (!newCropName.trim()) {
      toast({ title: "Ошибка", description: "Введите название культуры", variant: "destructive" });
      return;
    }
    const newCrop: CropConfig = {
      id: crypto.randomUUID(),
      name: newCropName.trim(),
      depths: newCropDepths.split(",").map((d) => d.trim()).filter(Boolean),
      removal: { ...newCropRemoval },
    };
    setCrops((prev) => [...prev, newCrop]);
    setNewCropName("");
    setNewCropDepths("3-4 см, 4-5 см, 5-6 см");
    setNewCropRemoval({ N: "", P2O5: "", K2O: "" });
    toast({ title: "Добавлено", description: `Культура «${newCrop.name}» добавлена` });
  };

  const handleDeleteCrop = (id: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== id));
    if (selectedCropId === id) {
      setSelectedCropId("");
      setSelectedDepth("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Расчет внесения удобрений
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Пошаговый калькулятор потребности в N, P₂O₅, K₂O
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Настройки культур
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Настройки культур</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Existing crops */}
                  {crops.map((crop) => (
                    <Card key={crop.id}>
                      <CardContent className="p-4">
                        {editingCrop?.id === crop.id ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Название</Label>
                              <Input value={editingCrop.name} onChange={(e) => setEditingCrop({ ...editingCrop, name: e.target.value })} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Глубины (через запятую)</Label>
                              <Input value={editingCrop.depths.join(", ")} onChange={(e) => setEditingCrop({ ...editingCrop, depths: e.target.value.split(",").map((d) => d.trim()).filter(Boolean) })} className="h-8 text-sm" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {ELEMENTS.map((el) => (
                                <div key={el} className="space-y-1">
                                  <Label className="text-xs">Вынос {el} (кг/т)</Label>
                                  <Input value={editingCrop.removal[el]} onChange={(e) => setEditingCrop({ ...editingCrop, removal: { ...editingCrop.removal, [el]: e.target.value } })} className="h-8 text-sm" />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveCropSettings(editingCrop)}>Сохранить</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCrop(null)}>Отмена</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{crop.name}</p>
                              <p className="text-xs text-muted-foreground">
                                N: {crop.removal.N} · P₂O₅: {crop.removal.P2O5} · K₂O: {crop.removal.K2O} кг/т
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setEditingCrop({ ...crop })}>
                                <Settings className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteCrop(crop.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add new crop */}
                  <Card className="border-dashed">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm font-medium">Добавить культуру</p>
                      <div className="space-y-1">
                        <Label className="text-xs">Название</Label>
                        <Input value={newCropName} onChange={(e) => setNewCropName(e.target.value)} placeholder="Например: Горох" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Глубины посадки (через запятую)</Label>
                        <Input value={newCropDepths} onChange={(e) => setNewCropDepths(e.target.value)} className="h-8 text-sm" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {ELEMENTS.map((el) => (
                          <div key={el} className="space-y-1">
                            <Label className="text-xs">Вынос {el} (кг/т)</Label>
                            <Input value={newCropRemoval[el]} onChange={(e) => setNewCropRemoval((prev) => ({ ...prev, [el]: e.target.value }))} placeholder="0" className="h-8 text-sm" />
                          </div>
                        ))}
                      </div>
                      <Button size="sm" onClick={handleAddCrop} className="gap-1">
                        <Plus className="h-3 w-3" /> Добавить
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>

            {/* History */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" /> История
                  {history.length > 0 && <Badge variant="secondary" className="ml-1">{history.length}</Badge>}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>История расчетов</DialogTitle>
                </DialogHeader>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">Нет сохраненных расчетов</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((rec) => (
                      <Card key={rec.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => loadFromHistory(rec)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium">{rec.crop} · {rec.depth}</p>
                              <p className="text-xs text-muted-foreground">{rec.date} · {rec.user}</p>
                            </div>
                            <Badge variant="outline">Загрузить</Badge>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span>N: <strong>{fmt(rec.results.N.activeDose)}</strong></span>
                            <span>P₂O₅: <strong>{fmt(rec.results.P2O5.activeDose)}</strong></span>
                            <span>K₂O: <strong>{fmt(rec.results.K2O.activeDose)}</strong></span>
                            <span className="text-muted-foreground">кг д.в./га</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* User name */}
        <div className="flex items-center gap-2 max-w-xs">
          <Label className="whitespace-nowrap text-sm">Агроном:</Label>
          <Input value={userName} onChange={(e) => setUserName(e.target.value)} className="h-8 text-sm" />
        </div>

        {/* Crop & depth selection */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Культура</Label>
                <Select value={selectedCropId} onValueChange={handleCropChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите культуру" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Глубина посадки</Label>
                <Select value={selectedDepth} onValueChange={setSelectedDepth} disabled={!selectedCrop}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выберите глубину" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCrop?.depths.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {ELEMENTS.map((el) => (
            <Card key={el} className={`border ${ELEMENT_COLORS[el]}`}>
              <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleElement(el)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className={ELEMENT_BADGE[el]}>{el}</Badge>
                    {ELEMENT_LABELS[el]}
                  </CardTitle>
                  {expandedElements[el] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardHeader>
              {expandedElements[el] && (
                <CardContent className="space-y-3 pt-0">
                  {FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-xs">
                        {f.label}
                        {f.autoFill && selectedCrop && (
                          <span className="text-muted-foreground ml-1">(авто)</span>
                        )}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={inputs[el][f.key]}
                          onChange={(e) => handleInputChange(el, f.key, e.target.value)}
                          placeholder="0"
                          className="h-8 text-sm"
                          readOnly={f.autoFill && !!selectedCrop}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px]">{f.unit}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={calculate} className="gap-1">
            <Calculator className="h-4 w-4" /> Рассчитать
          </Button>
          <Button variant="outline" onClick={clearAll} className="gap-1">
            <Trash2 className="h-4 w-4" /> Очистить
          </Button>
          {results && (
            <Button variant="secondary" onClick={saveCalculation} className="gap-1">
              <Save className="h-4 w-4" /> Сохранить расчет
            </Button>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этапы расчета</CardTitle>
                <CardDescription>
                  {selectedCrop?.name} · {selectedDepth}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Этап</TableHead>
                        {ELEMENTS.map((el) => (
                          <TableHead key={el} className="text-center min-w-[120px]">
                            <Badge className={ELEMENT_BADGE[el]}>{el}</Badge>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { label: "Общая потребность", key: "totalNeed" as const, unit: "кг/га" },
                        { label: "Поступит из почвы", key: "fromSoil" as const, unit: "кг/га" },
                        { label: "Поступление с органикой", key: "fromOrganic" as const, unit: "кг/га" },
                        { label: "Дефицит питательного вещества", key: "deficit" as const, unit: "кг/га" },
                        { label: "Доза действующего вещества", key: "activeDose" as const, unit: "кг д.в./га" },
                      ].map((row) => (
                        <TableRow key={row.key}>
                          <TableCell className="font-medium">
                            {row.label}
                            <span className="text-muted-foreground text-xs ml-1">({row.unit})</span>
                          </TableCell>
                          {ELEMENTS.map((el) => (
                            <TableCell key={el} className="text-center font-mono">
                              {fmt(results[el][row.key])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🌱 Итоговая рекомендуемая доза
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ELEMENTS.map((el) => (
                    <Card key={el} className={`border ${ELEMENT_COLORS[el]}`}>
                      <CardContent className="p-4 text-center">
                        <Badge className={`${ELEMENT_BADGE[el]} mb-2`}>{el}</Badge>
                        <p className="text-3xl font-bold mt-1">{fmt(results[el].activeDose)}</p>
                        <p className="text-xs text-muted-foreground mt-1">кг д.в./га</p>
                        {results[el].deficit === 0 && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3" />
                            Дефицита нет
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
