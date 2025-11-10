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
  { id: "winter-wheat", name: "Озимая пшеница", type: "зерно" },
  { id: "spring-wheat", name: "Яровая пшеница", type: "зерно" },
  { id: "corn", name: "Кукуруза", type: "кукуруза" },
  { id: "sunflower", name: "Подсолнечник", type: "зерно" },
  { id: "barley", name: "Ячмень", type: "зерно" },
  { id: "rapeseed", name: "Рапс", type: "зерно" },
  { id: "soybean", name: "Соя", type: "зерно" },
  { id: "potato", name: "Картофель", type: "зерно" },
];

const optimalConditions: Record<string, {
  soilTemp: { min: number; max: number; optimal: number };
  soilMoisture: { min: number; max: number; optimal: number };
  ph: { min: number; max: number; optimal: number };
  description: string;
}> = {
  "winter-wheat": {
    soilTemp: { min: 3, max: 8, optimal: 5 },
    soilMoisture: { min: 60, max: 75, optimal: 70 },
    ph: { min: 6.0, max: 7.5, optimal: 6.5 },
    description: "Озимая пшеница требует прохладных условий для посева"
  },
  "spring-wheat": {
    soilTemp: { min: 5, max: 12, optimal: 8 },
    soilMoisture: { min: 60, max: 75, optimal: 68 },
    ph: { min: 6.0, max: 7.5, optimal: 6.8 },
    description: "Яровая пшеница требует умеренного тепла"
  },
  "corn": {
    soilTemp: { min: 10, max: 18, optimal: 14 },
    soilMoisture: { min: 65, max: 80, optimal: 72 },
    ph: { min: 5.8, max: 7.0, optimal: 6.5 },
    description: "Кукуруза требует теплой почвы и достаточной влаги"
  },
  "sunflower": {
    soilTemp: { min: 8, max: 14, optimal: 10 },
    soilMoisture: { min: 60, max: 70, optimal: 65 },
    ph: { min: 6.0, max: 7.2, optimal: 6.5 },
    description: "Подсолнечник устойчив к засухе, но требует тепла"
  },
  "barley": {
    soilTemp: { min: 4, max: 10, optimal: 7 },
    soilMoisture: { min: 60, max: 75, optimal: 68 },
    ph: { min: 6.0, max: 7.5, optimal: 7.0 },
    description: "Ячмень хорошо переносит прохладную погоду"
  },
  "rapeseed": {
    soilTemp: { min: 5, max: 12, optimal: 8 },
    soilMoisture: { min: 65, max: 78, optimal: 72 },
    ph: { min: 6.0, max: 7.5, optimal: 6.8 },
    description: "Рапс требует достаточной влаги и умеренного тепла"
  },
  "soybean": {
    soilTemp: { min: 10, max: 18, optimal: 15 },
    soilMoisture: { min: 65, max: 80, optimal: 75 },
    ph: { min: 6.0, max: 7.0, optimal: 6.5 },
    description: "Соя требует теплых условий и хорошего увлажнения"
  },
  "potato": {
    soilTemp: { min: 7, max: 15, optimal: 10 },
    soilMoisture: { min: 70, max: 85, optimal: 78 },
    ph: { min: 5.0, max: 6.5, optimal: 5.5 },
    description: "Картофель требует прохладной почвы и высокой влажности"
  }
};

const fieldsData = [
  { id: "field1", name: "Поле №1", currentTemp: 12, currentMoisture: 65, currentPh: 6.8 },
  { id: "field2", name: "Поле №2", currentTemp: 8, currentMoisture: 70, currentPh: 6.2 },
  { id: "field3", name: "Поле №3", currentTemp: 15, currentMoisture: 60, currentPh: 7.0 },
  { id: "field4", name: "Поле №4", currentTemp: 10, currentMoisture: 75, currentPh: 6.5 },
  { id: "field5", name: "Поле №5", currentTemp: 14, currentMoisture: 68, currentPh: 6.9 },
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
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const currentField = fieldsData.find(f => f.id === selectedField);
  const currentCrop = crops.find(c => c.id === selectedCrop);
  const optimal = selectedCrop ? optimalConditions[selectedCrop] : null;

  const getStatusIcon = (current: number, min: number, max: number, optimal: number) => {
    if (current < min || current > max) return { color: "text-destructive", text: "Критично" };
    if (Math.abs(current - optimal) <= (max - min) * 0.2) return { color: "text-primary", text: "Оптимально" };
    return { color: "text-accent", text: "Допустимо" };
  };

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

                <div className="space-y-2">
                  <Label htmlFor="crop">Культура</Label>
                  <Select onValueChange={setSelectedCrop}>
                    <SelectTrigger id="crop">
                      <SelectValue placeholder="Выберите культуру" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          {crop.name} ({crop.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="field">Поле</Label>
                  <Select onValueChange={setSelectedField}>
                    <SelectTrigger id="field">
                      <SelectValue placeholder="Выберите поле" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldsData.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCrop && optimal && (
                  <div className="space-y-2">
                    <Label>Оптимальные условия для {currentCrop?.name}</Label>
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="pt-4 space-y-3 text-sm">
                        <p className="text-muted-foreground italic">{optimal.description}</p>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <span>Температура почвы:</span>
                            <span className="font-medium">{optimal.soilTemp.optimal}°C ({optimal.soilTemp.min}-{optimal.soilTemp.max}°C)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Влажность почвы:</span>
                            <span className="font-medium">{optimal.soilMoisture.optimal}% ({optimal.soilMoisture.min}-{optimal.soilMoisture.max}%)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>pH почвы:</span>
                            <span className="font-medium">{optimal.ph.optimal} ({optimal.ph.min}-{optimal.ph.max})</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedField && currentField && selectedCrop && optimal && (
                  <div className="space-y-2">
                    <Label>Текущие условия на {currentField.name}</Label>
                    <Card className="bg-background border-border">
                      <CardContent className="pt-4 space-y-3 text-sm">
                        <div className="grid gap-3">
                          <div className="flex justify-between items-center">
                            <span>Температура почвы:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currentField.currentTemp}°C</span>
                              <Badge variant="outline" className={getStatusIcon(currentField.currentTemp, optimal.soilTemp.min, optimal.soilTemp.max, optimal.soilTemp.optimal).color}>
                                {getStatusIcon(currentField.currentTemp, optimal.soilTemp.min, optimal.soilTemp.max, optimal.soilTemp.optimal).text}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Влажность почвы:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currentField.currentMoisture}%</span>
                              <Badge variant="outline" className={getStatusIcon(currentField.currentMoisture, optimal.soilMoisture.min, optimal.soilMoisture.max, optimal.soilMoisture.optimal).color}>
                                {getStatusIcon(currentField.currentMoisture, optimal.soilMoisture.min, optimal.soilMoisture.max, optimal.soilMoisture.optimal).text}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>pH почвы:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{currentField.currentPh}</span>
                              <Badge variant="outline" className={getStatusIcon(currentField.currentPh, optimal.ph.min, optimal.ph.max, optimal.ph.optimal).color}>
                                {getStatusIcon(currentField.currentPh, optimal.ph.min, optimal.ph.max, optimal.ph.optimal).text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {selectedField && currentField && selectedCrop && optimal && (
                  <div className="space-y-2">
                    <Label>Рекомендации системы</Label>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-4 space-y-2 text-sm">
                        {currentField.currentTemp < optimal.soilTemp.min && (
                          <p className="flex items-start">
                            <span className="text-destructive mr-2">⚠</span>
                            <span>Температура почвы слишком низкая ({currentField.currentTemp}°C). Рекомендуется отложить посев до прогрева до {optimal.soilTemp.min}°C</span>
                          </p>
                        )}
                        {currentField.currentTemp > optimal.soilTemp.max && (
                          <p className="flex items-start">
                            <span className="text-destructive mr-2">⚠</span>
                            <span>Температура почвы слишком высокая ({currentField.currentTemp}°C). Рекомендуется полив и ожидание снижения до {optimal.soilTemp.max}°C</span>
                          </p>
                        )}
                        {currentField.currentTemp >= optimal.soilTemp.min && currentField.currentTemp <= optimal.soilTemp.max && (
                          <p className="flex items-start">
                            <span className="text-primary mr-2">✓</span>
                            <span>Температура почвы в норме ({currentField.currentTemp}°C)</span>
                          </p>
                        )}
                        
                        {currentField.currentMoisture < optimal.soilMoisture.min && (
                          <p className="flex items-start">
                            <span className="text-destructive mr-2">⚠</span>
                            <span>Влажность почвы низкая ({currentField.currentMoisture}%). Рекомендуется полив до {optimal.soilMoisture.optimal}%</span>
                          </p>
                        )}
                        {currentField.currentMoisture > optimal.soilMoisture.max && (
                          <p className="flex items-start">
                            <span className="text-destructive mr-2">⚠</span>
                            <span>Влажность почвы высокая ({currentField.currentMoisture}%). Рекомендуется дренаж или ожидание испарения</span>
                          </p>
                        )}
                        {currentField.currentMoisture >= optimal.soilMoisture.min && currentField.currentMoisture <= optimal.soilMoisture.max && (
                          <p className="flex items-start">
                            <span className="text-primary mr-2">✓</span>
                            <span>Влажность почвы в норме ({currentField.currentMoisture}%)</span>
                          </p>
                        )}
                        
                        {currentField.currentPh < optimal.ph.min && (
                          <p className="flex items-start">
                            <span className="text-accent mr-2">ℹ</span>
                            <span>pH почвы низкий ({currentField.currentPh}). Рекомендуется известкование</span>
                          </p>
                        )}
                        {currentField.currentPh > optimal.ph.max && (
                          <p className="flex items-start">
                            <span className="text-accent mr-2">ℹ</span>
                            <span>pH почвы высокий ({currentField.currentPh}). Рекомендуется внесение серы или органики</span>
                          </p>
                        )}
                        {currentField.currentPh >= optimal.ph.min && currentField.currentPh <= optimal.ph.max && (
                          <p className="flex items-start">
                            <span className="text-primary mr-2">✓</span>
                            <span>pH почвы в норме ({currentField.currentPh})</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {selectedTaskType === "Предпосевная обработка" && (
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
                              disabled={(date) => startDate ? date < startDate : false}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
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
