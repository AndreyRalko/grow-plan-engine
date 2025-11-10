import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cloud, Database, Satellite, Thermometer } from "lucide-react";

const integrations = [
  {
    id: 1,
    name: "Погодные датчики",
    description: "Мониторинг температуры, влажности и осадков в реальном времени",
    icon: Thermometer,
    status: true,
  },
  {
    id: 2,
    name: "Спутниковый мониторинг",
    description: "Анализ состояния полей через спутниковые снимки",
    icon: Satellite,
    status: true,
  },
  {
    id: 3,
    name: "Облачное хранилище",
    description: "Синхронизация данных с облачным хранилищем",
    icon: Cloud,
    status: false,
  },
  {
    id: 4,
    name: "База данных аналитики",
    description: "Интеграция с системой бизнес-аналитики",
    icon: Database,
    status: true,
  },
];

export default function Integrations() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Интеграции</h1>
          <p className="text-muted-foreground">Подключенные системы и датчики</p>
        </div>

        <div className="grid gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="border-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <integration.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Switch checked={integration.status} />
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Настроить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
