import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const equipment = [
  { id: 1, name: "Трактор МТЗ-82", type: "Трактор", status: "active", lastMaintenance: "2025-10-15" },
  { id: 2, name: "Комбайн Енисей-1200", type: "Комбайн", status: "maintenance", lastMaintenance: "2025-11-01" },
  { id: 3, name: "Сеялка СЗ-3.6", type: "Сеялка", status: "active", lastMaintenance: "2025-09-20" },
  { id: 4, name: "Плуг ПЛН-5-35", type: "Плуг", status: "active", lastMaintenance: "2025-10-01" },
  { id: 5, name: "Культиватор КПС-4", type: "Культиватор", status: "idle", lastMaintenance: "2025-08-15" },
  { id: 6, name: "Опрыскиватель ОП-2000", type: "Опрыскиватель", status: "active", lastMaintenance: "2025-10-25" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-primary text-primary-foreground">В работе</Badge>;
    case "maintenance":
      return <Badge className="bg-accent text-accent-foreground">На обслуживании</Badge>;
    case "idle":
      return <Badge variant="outline">Простой</Badge>;
    default:
      return null;
  }
};

export default function Equipment() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Техника</h1>
            <p className="text-muted-foreground">Учет и управление сельхозтехникой</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Добавить технику
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card key={item.id} className="border-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Последнее ТО:</span>
                  <span className="font-medium">
                    {new Date(item.lastMaintenance).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  <Wrench className="h-4 w-4 mr-2" />
                  Обслуживание
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
