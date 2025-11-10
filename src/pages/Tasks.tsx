import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, Clock, AlertCircle, CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const taskTypes = [
  "Предпосевная обработка",
  "Посев",
  "Учет и наблюдение роста",
  "Заготовка",
  "Хранение",
  "Корм скота",
];

const crops = [
  "Озимая пшеница",
  "Яровая пшеница",
  "Кукуруза",
  "Подсолнечник",
  "Ячмень",
  "Рапс",
  "Соя",
  "Картофель",
];

const tasks = [
  {
    id: 1,
    title: "Предпосевная обработка поля №3",
    type: "Предпосевная обработка",
    assignee: "Иванов И.И.",
    status: "in-progress",
    field: "Поле №3",
    dueDate: "2025-11-15",
  },
  {
    id: 2,
    title: "Посев озимой пшеницы",
    type: "Посев",
    assignee: "Петров П.П.",
    status: "pending",
    field: "Поле №1",
    dueDate: "2025-11-18",
  },
  {
    id: 3,
    title: "Наблюдение за всходами кукурузы",
    type: "Учет и наблюдение роста",
    assignee: "Сидоров С.С.",
    status: "completed",
    field: "Поле №2",
    dueDate: "2025-11-12",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="h-3 w-3 mr-1" /> Завершено</Badge>;
    case "in-progress":
      return <Badge className="bg-accent text-accent-foreground"><Clock className="h-3 w-3 mr-1" /> В работе</Badge>;
    case "pending":
      return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Ожидает</Badge>;
    default:
      return null;
  }
};

export default function Tasks() {
  const [selectedTaskType, setSelectedTaskType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Задания</h1>
            <p className="text-muted-foreground">Управление и назначение задач</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Создать задание
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Новое задание</DialogTitle>
                <DialogDescription>
                  Заполните информацию для создания нового задания
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-type">Тип задания</Label>
                  <Select onValueChange={setSelectedTaskType}>
                    <SelectTrigger id="task-type">
                      <SelectValue placeholder="Выберите тип задания" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedTaskType === "Предпосевная обработка" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="crop">Культура к посеву</Label>
                      <Select>
                        <SelectTrigger id="crop">
                          <SelectValue placeholder="Выберите культуру" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map((crop) => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Период выполнения</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date" className="text-sm text-muted-foreground">Начало</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="start-date"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="end-date" className="text-sm text-muted-foreground">Окончание</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="end-date"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                                className="pointer-events-auto"
                                disabled={(date) => startDate ? date < startDate : false}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="assignee">Исполнитель</Label>
                  <Select>
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder="Выберите сотрудника" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ivanov">Иванов И.И.</SelectItem>
                      <SelectItem value="petrov">Петров П.П.</SelectItem>
                      <SelectItem value="sidorov">Сидоров С.С.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="field">Поле</Label>
                  <Select>
                    <SelectTrigger id="field">
                      <SelectValue placeholder="Выберите поле" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field1">Поле №1</SelectItem>
                      <SelectItem value="field2">Поле №2</SelectItem>
                      <SelectItem value="field3">Поле №3</SelectItem>
                      <SelectItem value="field4">Поле №4</SelectItem>
                      <SelectItem value="field5">Поле №5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Рекомендации системы</Label>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4 space-y-2 text-sm">
                      <p className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>Температура почвы оптимальна для посева (12-15°C)</span>
                      </p>
                      <p className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>Влажность почвы: 65% - рекомендуется дополнительный полив</span>
                      </p>
                      <p className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>Прогноз: без осадков следующие 5 дней</span>
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Дополнительные заметки</Label>
                  <Textarea
                    id="notes"
                    placeholder="Введите дополнительную информацию..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Отмена</Button>
                <Button className="bg-primary text-primary-foreground">Создать задание</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="border-border hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      <span className="text-muted-foreground">{task.type}</span>
                      <span>•</span>
                      <span>{task.field}</span>
                      <span>•</span>
                      <span>Срок: {new Date(task.dueDate).toLocaleDateString('ru-RU')}</span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Исполнитель: <span className="text-foreground font-medium">{task.assignee}</span>
                  </div>
                  <Button variant="outline" size="sm">Подробнее</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
