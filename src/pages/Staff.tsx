import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const staff = [
  { id: 1, name: "Иванов Иван Иванович", role: "Агроном", phone: "+7 (999) 123-45-67", email: "ivanov@agro.ru" },
  { id: 2, name: "Петров Петр Петрович", role: "Бригадир", phone: "+7 (999) 234-56-78", email: "petrov@agro.ru" },
  { id: 3, name: "Сидоров Сидор Сидорович", role: "Механик", phone: "+7 (999) 345-67-89", email: "sidorov@agro.ru" },
  { id: 4, name: "Кузнецова Анна Сергеевна", role: "Зоотехник", phone: "+7 (999) 456-78-90", email: "kuznetsova@agro.ru" },
];

export default function Staff() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Персонал</h1>
            <p className="text-muted-foreground">Управление сотрудниками предприятия</p>
          </div>
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Добавить сотрудника
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((person) => (
            <Card key={person.id} className="border-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 bg-primary/10">
                    <AvatarFallback className="text-primary text-lg font-semibold">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 text-primary" />
                  {person.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 text-primary" />
                  {person.email}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
