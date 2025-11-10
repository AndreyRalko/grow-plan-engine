import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const taskTypes = [
  {
    id: "pre-sowing",
    name: "Предпосевная обработка",
    params: [
      { key: "soilTemp", label: "Температура почвы (°C)", min: "8", max: "18", optimal: "12-15" },
      { key: "soilMoisture", label: "Влажность почвы (%)", min: "50", max: "80", optimal: "60-70" },
      { key: "tillageDepth", label: "Глубина обработки (см)", min: "15", max: "30", optimal: "20-25" },
    ],
  },
  {
    id: "sowing",
    name: "Посев",
    params: [
      { key: "seedRate", label: "Норма высева (кг/га)", min: "100", max: "300", optimal: "180-220" },
      { key: "sowingDepth", label: "Глубина заделки (см)", min: "3", max: "8", optimal: "4-6" },
      { key: "rowSpacing", label: "Междурядье (см)", min: "15", max: "45", optimal: "30" },
    ],
  },
  {
    id: "monitoring",
    name: "Учет и наблюдение роста",
    params: [
      { key: "plantHeight", label: "Высота растений (см)", min: "10", max: "100", optimal: "40-60" },
      { key: "leafColor", label: "Индекс зеленой массы (NDVI)", min: "0.3", max: "0.9", optimal: "0.6-0.8" },
      { key: "density", label: "Густота растений (шт/м²)", min: "200", max: "500", optimal: "300-400" },
    ],
  },
  {
    id: "harvesting",
    name: "Заготовка",
    params: [
      { key: "moisture", label: "Влажность зерна (%)", min: "12", max: "20", optimal: "14-16" },
      { key: "maturity", label: "Степень зрелости (%)", min: "85", max: "100", optimal: "95-98" },
      { key: "yield", label: "Урожайность (ц/га)", min: "30", max: "80", optimal: "50-70" },
    ],
  },
  {
    id: "storage",
    name: "Хранение",
    params: [
      { key: "temperature", label: "Температура хранения (°C)", min: "-5", max: "15", optimal: "5-10" },
      { key: "humidity", label: "Влажность воздуха (%)", min: "60", max: "80", optimal: "65-75" },
      { key: "ventilation", label: "Частота вентиляции (раз/день)", min: "1", max: "4", optimal: "2-3" },
    ],
  },
  {
    id: "feeding",
    name: "Корм скота",
    params: [
      { key: "feedRate", label: "Норма корма (кг/голову)", min: "5", max: "25", optimal: "12-18" },
      { key: "protein", label: "Содержание белка (%)", min: "12", max: "20", optimal: "15-17" },
      { key: "waterRate", label: "Норма воды (л/голову)", min: "20", max: "60", optimal: "35-45" },
    ],
  },
];

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Оптимальные параметры успешно обновлены",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Настройки</h1>
          <p className="text-muted-foreground">Настройка оптимальных параметров для каждого типа задания</p>
        </div>

        <Tabs defaultValue="pre-sowing" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            {taskTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs lg:text-sm">
                {type.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {taskTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{type.name}</CardTitle>
                  <CardDescription>
                    Настройте оптимальные параметры для типа задания "{type.name}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {type.params.map((param) => (
                    <div key={param.key} className="space-y-3">
                      <Label htmlFor={`${type.id}-${param.key}`} className="text-base font-medium">
                        {param.label}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${type.id}-${param.key}-min`} className="text-sm text-muted-foreground">
                            Минимум
                          </Label>
                          <Input
                            id={`${type.id}-${param.key}-min`}
                            type="number"
                            defaultValue={param.min}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${type.id}-${param.key}-optimal`} className="text-sm text-primary font-medium">
                            Оптимальный диапазон
                          </Label>
                          <Input
                            id={`${type.id}-${param.key}-optimal`}
                            type="text"
                            defaultValue={param.optimal}
                            className="bg-primary/5 border-primary/30 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${type.id}-${param.key}-max`} className="text-sm text-muted-foreground">
                            Максимум
                          </Label>
                          <Input
                            id={`${type.id}-${param.key}-max`}
                            type="number"
                            defaultValue={param.max}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить параметры
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}
