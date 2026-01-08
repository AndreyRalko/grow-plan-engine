import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Play, 
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Ruler,
  Timer,
  Eye
} from "lucide-react";

// Типы датчиков
const sensors = [
  { id: "temp_soil", name: "Температура почвы", icon: Thermometer, unit: "°C" },
  { id: "temp_air", name: "Температура воздуха", icon: Thermometer, unit: "°C" },
  { id: "humidity_soil", name: "Влажность почвы", icon: Droplets, unit: "%" },
  { id: "humidity_air", name: "Влажность воздуха", icon: Droplets, unit: "%" },
  { id: "wind_speed", name: "Скорость ветра", icon: Wind, unit: "м/с" },
  { id: "pressure", name: "Атм. давление", icon: Gauge, unit: "гПа" },
  { id: "depth", name: "Датчик глубины", icon: Ruler, unit: "см" },
  { id: "speed", name: "Датчик скорости", icon: Timer, unit: "км/ч" },
];

type FieldType = "start_condition" | "execution";

interface OperationField {
  id: string;
  name: string;
  unit: string;
  sensorId: string | null;
  type: FieldType;
  minValue?: number;
  maxValue?: number;
}

interface AgroOperation {
  id: string;
  name: string;
  description: string;
  fields: OperationField[];
}

// Примеры операций
const initialOperations: AgroOperation[] = [
  {
    id: "1",
    name: "Посев",
    description: "Посев сельскохозяйственных культур",
    fields: [
      { id: "1", name: "Температура почвы", unit: "°C", sensorId: "temp_soil", type: "start_condition", minValue: 8, maxValue: 25 },
      { id: "2", name: "Влажность почвы", unit: "%", sensorId: "humidity_soil", type: "start_condition", minValue: 40, maxValue: 70 },
      { id: "3", name: "Ширина междурядья", unit: "см", sensorId: null, type: "execution" },
      { id: "4", name: "Глубина посадки", unit: "см", sensorId: "depth", type: "execution" },
      { id: "5", name: "Скорость движения", unit: "км/ч", sensorId: "speed", type: "execution" },
    ]
  },
  {
    id: "2",
    name: "Опрыскивание",
    description: "Обработка культур средствами защиты",
    fields: [
      { id: "1", name: "Скорость ветра", unit: "м/с", sensorId: "wind_speed", type: "start_condition", minValue: 0, maxValue: 4 },
      { id: "2", name: "Температура воздуха", unit: "°C", sensorId: "temp_air", type: "start_condition", minValue: 10, maxValue: 25 },
      { id: "3", name: "Влажность воздуха", unit: "%", sensorId: "humidity_air", type: "start_condition", minValue: 40, maxValue: 90 },
      { id: "4", name: "Норма расхода", unit: "л/га", sensorId: null, type: "execution" },
      { id: "5", name: "Высота штанги", unit: "см", sensorId: null, type: "execution" },
    ]
  },
];

export default function AgroOperations() {
  const [operations, setOperations] = useState<AgroOperation[]>(initialOperations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<AgroOperation | null>(null);
  const [newOperation, setNewOperation] = useState<AgroOperation>({
    id: "",
    name: "",
    description: "",
    fields: []
  });

  const [newField, setNewField] = useState<Partial<OperationField>>({
    name: "",
    unit: "",
    sensorId: null,
    type: "start_condition"
  });

  const handleAddField = (type: FieldType) => {
    if (!newField.name) return;
    
    const field: OperationField = {
      id: Date.now().toString(),
      name: newField.name || "",
      unit: newField.unit || "",
      sensorId: newField.sensorId || null,
      type: type,
      minValue: newField.minValue,
      maxValue: newField.maxValue,
    };

    if (editingOperation) {
      setEditingOperation({
        ...editingOperation,
        fields: [...editingOperation.fields, field]
      });
    } else {
      setNewOperation({
        ...newOperation,
        fields: [...newOperation.fields, field]
      });
    }

    setNewField({ name: "", unit: "", sensorId: null, type: "start_condition" });
  };

  const handleRemoveField = (fieldId: string) => {
    if (editingOperation) {
      setEditingOperation({
        ...editingOperation,
        fields: editingOperation.fields.filter(f => f.id !== fieldId)
      });
    } else {
      setNewOperation({
        ...newOperation,
        fields: newOperation.fields.filter(f => f.id !== fieldId)
      });
    }
  };

  const handleSaveOperation = () => {
    if (editingOperation) {
      setOperations(operations.map(op => 
        op.id === editingOperation.id ? editingOperation : op
      ));
      setEditingOperation(null);
    } else {
      const operation = {
        ...newOperation,
        id: Date.now().toString()
      };
      setOperations([...operations, operation]);
      setNewOperation({ id: "", name: "", description: "", fields: [] });
    }
    setIsDialogOpen(false);
  };

  const handleEditOperation = (operation: AgroOperation) => {
    setEditingOperation(operation);
    setIsDialogOpen(true);
  };

  const handleDeleteOperation = (operationId: string) => {
    setOperations(operations.filter(op => op.id !== operationId));
  };

  const currentOperation = editingOperation || newOperation;
  const setCurrentOperation = editingOperation ? setEditingOperation : setNewOperation;

  const getSensorInfo = (sensorId: string | null) => {
    return sensors.find(s => s.id === sensorId);
  };

  const renderFieldCard = (field: OperationField, isEditing: boolean = false) => {
    const sensor = getSensorInfo(field.sensorId);
    const SensorIcon = sensor?.icon || Activity;

    return (
      <div key={field.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${field.type === 'start_condition' ? 'bg-amber-500/20 text-amber-600' : 'bg-blue-500/20 text-blue-600'}`}>
            <SensorIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{field.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {sensor ? (
                <span>Датчик: {sensor.name}</span>
              ) : (
                <span className="text-muted-foreground/50">Без датчика</span>
              )}
              {field.unit && <Badge variant="outline" className="text-xs">{field.unit}</Badge>}
            </div>
            {field.type === "start_condition" && (field.minValue !== undefined || field.maxValue !== undefined) && (
              <p className="text-xs text-muted-foreground mt-1">
                Диапазон: {field.minValue ?? "—"} - {field.maxValue ?? "—"} {field.unit}
              </p>
            )}
          </div>
        </div>
        {isEditing && (
          <Button variant="ghost" size="icon" onClick={() => handleRemoveField(field.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Агро-операции</h1>
            <p className="text-muted-foreground">
              Управление типами агро-операций и их параметрами
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingOperation(null);
              setNewOperation({ id: "", name: "", description: "", fields: [] });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить операцию
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingOperation ? "Редактирование операции" : "Новая агро-операция"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Основная информация */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operation-name">Название операции</Label>
                    <Input
                      id="operation-name"
                      placeholder="Например: Посев, Опрыскивание..."
                      value={currentOperation.name}
                      onChange={(e) => setCurrentOperation({ ...currentOperation, name: e.target.value } as any)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operation-desc">Описание</Label>
                    <Input
                      id="operation-desc"
                      placeholder="Краткое описание операции..."
                      value={currentOperation.description}
                      onChange={(e) => setCurrentOperation({ ...currentOperation, description: e.target.value } as any)}
                    />
                  </div>
                </div>

                {/* Поля операции */}
                <Tabs defaultValue="start_condition" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="start_condition" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Условия старта
                    </TabsTrigger>
                    <TabsTrigger value="execution" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Индикаторы выполнения
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="start_condition" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Параметры, определяющие готовность к началу операции
                    </p>
                    
                    {/* Существующие поля */}
                    <div className="space-y-2">
                      {currentOperation.fields
                        .filter(f => f.type === "start_condition")
                        .map(field => renderFieldCard(field, true))}
                    </div>

                    {/* Форма добавления поля */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Название параметра</Label>
                              <Input
                                placeholder="Например: Влажность почвы"
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Единица измерения</Label>
                              <Input
                                placeholder="%, °C, м/с..."
                                value={newField.unit}
                                onChange={(e) => setNewField({ ...newField, unit: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Датчик для получения данных</Label>
                            <Select
                              value={newField.sensorId || "none"}
                              onValueChange={(value) => setNewField({ ...newField, sensorId: value === "none" ? null : value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите датчик" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Без датчика (ручной ввод)</SelectItem>
                                {sensors.map(sensor => {
                                  const Icon = sensor.icon;
                                  return (
                                    <SelectItem key={sensor.id} value={sensor.id}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {sensor.name} ({sensor.unit})
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Мин. значение</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={newField.minValue ?? ""}
                                onChange={(e) => setNewField({ ...newField, minValue: e.target.value ? Number(e.target.value) : undefined })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Макс. значение</Label>
                              <Input
                                type="number"
                                placeholder="100"
                                value={newField.maxValue ?? ""}
                                onChange={(e) => setNewField({ ...newField, maxValue: e.target.value ? Number(e.target.value) : undefined })}
                              />
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => handleAddField("start_condition")}
                            disabled={!newField.name}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить условие
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="execution" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Параметры, контролируемые во время выполнения операции
                    </p>
                    
                    {/* Существующие поля */}
                    <div className="space-y-2">
                      {currentOperation.fields
                        .filter(f => f.type === "execution")
                        .map(field => renderFieldCard(field, true))}
                    </div>

                    {/* Форма добавления поля */}
                    <Card className="border-dashed">
                      <CardContent className="pt-4">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Название параметра</Label>
                              <Input
                                placeholder="Например: Глубина посадки"
                                value={newField.name}
                                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Единица измерения</Label>
                              <Input
                                placeholder="см, л/га..."
                                value={newField.unit}
                                onChange={(e) => setNewField({ ...newField, unit: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Датчик для мониторинга</Label>
                            <Select
                              value={newField.sensorId || "none"}
                              onValueChange={(value) => setNewField({ ...newField, sensorId: value === "none" ? null : value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите датчик" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Без датчика (ручной ввод)</SelectItem>
                                {sensors.map(sensor => {
                                  const Icon = sensor.icon;
                                  return (
                                    <SelectItem key={sensor.id} value={sensor.id}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {sensor.name} ({sensor.unit})
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => handleAddField("execution")}
                            disabled={!newField.name}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить индикатор
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveOperation} disabled={!currentOperation.name}>
                  {editingOperation ? "Сохранить" : "Создать операцию"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Список операций */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {operations.map(operation => {
            const startConditions = operation.fields.filter(f => f.type === "start_condition");
            const executionFields = operation.fields.filter(f => f.type === "execution");

            return (
              <Card key={operation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{operation.name}</CardTitle>
                      <CardDescription>{operation.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditOperation(operation)}>
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOperation(operation.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Условия старта */}
                  {startConditions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Play className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium">Условия старта</span>
                        <Badge variant="secondary" className="text-xs">{startConditions.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {startConditions.slice(0, 3).map(field => {
                          const sensor = getSensorInfo(field.sensorId);
                          return (
                            <div key={field.id} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {field.name}
                              {sensor && <Badge variant="outline" className="text-xs">{sensor.name}</Badge>}
                            </div>
                          );
                        })}
                        {startConditions.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{startConditions.length - 3} ещё</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Индикаторы выполнения */}
                  {executionFields.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Выполнение</span>
                        <Badge variant="secondary" className="text-xs">{executionFields.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {executionFields.slice(0, 3).map(field => {
                          const sensor = getSensorInfo(field.sensorId);
                          return (
                            <div key={field.id} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {field.name}
                              {sensor && <Badge variant="outline" className="text-xs">{sensor.name}</Badge>}
                            </div>
                          );
                        })}
                        {executionFields.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{executionFields.length - 3} ещё</span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full mt-2" onClick={() => handleEditOperation(operation)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
