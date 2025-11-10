import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const livestock = [
  { id: 1, type: "Коровы", count: 45, health: "Отличное", location: "Ферма №1" },
  { id: 2, type: "Телята", count: 18, health: "Хорошее", location: "Ферма №1" },
  { id: 3, type: "Свиньи", count: 63, health: "Отличное", location: "Ферма №2" },
  { id: 4, type: "Куры", count: 230, health: "Хорошее", location: "Птичник" },
];

export default function Livestock() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Животные</h1>
            <p className="text-muted-foreground">Учет поголовья и состояние здоровья</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Добавить запись
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {livestock.map((group) => (
            <Card key={group.id} className="border-border hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">{group.type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Количество голов</p>
                    <p className="text-3xl font-bold text-primary">{group.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Состояние здоровья</p>
                    <p className="text-lg font-medium text-foreground">{group.health}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Местоположение</p>
                  <p className="font-medium text-foreground">{group.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
