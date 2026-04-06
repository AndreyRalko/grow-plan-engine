import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calculator, Trash2, Save, History, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface ElementInputs {
  yield: string;
  removalPerTon: string;
  soilContent: string;
  soilCoeff: string;
  organicInput: string;
  organicCoeff: string;
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
  organicCoeff: "",
  mineralCoeff: "",
});

const FIELDS: { key: keyof ElementInputs; label: string; unit: string; isCoeff?: boolean }[] = [
  { key: "yield", label: "Планируемая урожайность", unit: "т/га" },
  { key: "removalPerTon", label: "Вынос на 1 т урожая", unit: "кг/т" },
  { key: "soilContent", label: "Содержание в почве", unit: "кг/га" },
  { key: "soilCoeff", label: "Коэф. использования из почвы", unit: "доля (0–1)", isCoeff: true },
  { key: "organicInput", label: "Поступление с органикой", unit: "кг/га" },
  { key: "organicCoeff", label: "Коэф. использования из органики", unit: "доля (0–1)", isCoeff: true },
  { key: "mineralCoeff", label: "Коэф. использования из мин. удобрения", unit: "доля (0–1)", isCoeff: true },
];

export default function FertilizerCalculator() {
  const { toast } = useToast();
  const [inputs, setInputs] = useState<Record<Element, ElementInputs>>({
    N: defaultInputs(),
    P2O5: defaultInputs(),
    K2O: defaultInputs(),
  });
  const [results, setResults] = useState<Record<Element, ElementResult> | null>(null);
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedElements, setExpandedElements] = useState<Record<Element, boolean>>({
    N: true, P2O5: true, K2O: true,
  });
  const [userName, setUserName] = useState("Агроном");

  const handleInputChange = (element: Element, key: keyof ElementInputs, value: string) => {
    // allow empty, digits, dot
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setInputs((prev) => ({
      ...prev,
      [element]: { ...prev[element], [key]: value },
    }));
    // clear results on edit
    setResults(null);
  };

  const validate = (): string | null => {
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
      const orgCoeff = parseFloat(i.organicCoeff);
      const minCoeff = parseFloat(i.mineralCoeff);

      const totalNeed = yld * removal;
      const fromSoil = soilContent * soilCoeff;
      const fromOrganic = orgInput * orgCoeff;
      const deficit = Math.max(0, totalNeed - fromSoil - fromOrganic);
      const activeDose = deficit / minCoeff;

      res[el] = { totalNeed, fromSoil, fromOrganic, deficit, activeDose };
    }
    setResults(res);
  };

  const clearAll = () => {
    setInputs({ N: defaultInputs(), P2O5: defaultInputs(), K2O: defaultInputs() });
    setResults(null);
  };

  const saveCalculation = () => {
    if (!results) return;
    const record: CalculationRecord = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString("ru-RU"),
      user: userName,
      inputs: JSON.parse(JSON.stringify(inputs)),
      results: JSON.parse(JSON.stringify(results)),
    };
    setHistory((prev) => [record, ...prev]);
    toast({ title: "Сохранено", description: "Расчет добавлен в историю" });
  };

  const loadFromHistory = (record: CalculationRecord) => {
    setInputs(JSON.parse(JSON.stringify(record.inputs)));
    setResults(JSON.parse(JSON.stringify(record.results)));
    setHistoryOpen(false);
  };

  const fmt = (n: number) => n.toFixed(2);

  const toggleElement = (el: Element) =>
    setExpandedElements((prev) => ({ ...prev, [el]: !prev[el] }));

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
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-1" /> История
                  {history.length > 0 && (
                    <Badge variant="secondary" className="ml-1">{history.length}</Badge>
                  )}
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
                              <p className="text-sm font-medium">{rec.date}</p>
                              <p className="text-xs text-muted-foreground">{rec.user}</p>
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
                      <Label className="text-xs">{f.label}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={inputs[el][f.key]}
                          onChange={(e) => handleInputChange(el, f.key, e.target.value)}
                          placeholder="0"
                          className="h-8 text-sm"
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
            {/* Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Этапы расчета</CardTitle>
                <CardDescription>Промежуточные результаты для каждого элемента питания</CardDescription>
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
                        { label: "Используемое из органики", key: "fromOrganic" as const, unit: "кг/га" },
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

            {/* Summary */}
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
