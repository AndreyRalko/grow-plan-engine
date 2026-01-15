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
  Wheat,
  Play, 
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Ruler,
  Timer,
  Edit,
  Eye
} from "lucide-react";

// Типы датчиков (должны совпадать с AgroOperations)
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
  sensorId: string | null;
  type: FieldType;
}

interface AgroOperation {
  id: string;
  name: string;
  description: string;
  fields: OperationField[];
}

// Операция в культуре с заполненными значениями
interface CropOperationField {
  fieldId: string;
  fieldName: string;
  sensorId: string | null;
  type: FieldType;
  value: string;
}

interface CropOperation {
  operationId: string;
  operationName: string;
  fields: CropOperationField[];
}

interface Crop {
  id: string;
  name: string;
  variety: string;
  operations: CropOperation[];
}

// Примеры агро-операций (в реальном приложении брались бы из общего хранилища)
const availableOperations: AgroOperation[] = [
  {
    id: "1",
    name: "Посев",
    description: "Посев сельскохозяйственных культур",
    fields: [
      { id: "1", name: "Температура почвы", sensorId: "temp_soil", type: "start_condition" },
      { id: "2", name: "Влажность почвы", sensorId: "humidity_soil", type: "start_condition" },
      { id: "3", name: "Ширина междурядья", sensorId: null, type: "execution" },
      { id: "4", name: "Глубина посадки", sensorId: "depth", type: "execution" },
      { id: "5", name: "Скорость движения", sensorId: "speed", type: "execution" },
    ]
  },
  {
    id: "2",
    name: "Опрыскивание",
    description: "Обработка культур средствами защиты",
    fields: [
      { id: "1", name: "Скорость ветра", sensorId: "wind_speed", type: "start_condition" },
      { id: "2", name: "Температура воздуха", sensorId: "temp_air", type: "start_condition" },
      { id: "3", name: "Влажность воздуха", sensorId: "humidity_air", type: "start_condition" },
      { id: "4", name: "Норма расхода", sensorId: null, type: "execution" },
      { id: "5", name: "Высота штанги", sensorId: null, type: "execution" },
    ]
  },
  {
    id: "3",
    name: "Уборка",
    description: "Уборка урожая",
    fields: [
      { id: "1", name: "Влажность зерна", sensorId: "humidity_air", type: "start_condition" },
      { id: "2", name: "Температура воздуха", sensorId: "temp_air", type: "start_condition" },
      { id: "3", name: "Скорость комбайна", sensorId: "speed", type: "execution" },
      { id: "4", name: "Высота среза", sensorId: null, type: "execution" },
    ]
  },
];

const initialCrops: Crop[] = [
  {
    id: "1",
    name: "Пшеница озимая",
    variety: "Безостая 100",
    operations: [
      {
        operationId: "1",
        operationName: "Посев",
        fields: [
          { fieldId: "1", fieldName: "Температура почвы", sensorId: "temp_soil", type: "start_condition", value: "12" },
          { fieldId: "2", fieldName: "Влажность почвы", sensorId: "humidity_soil", type: "start_condition", value: "65" },
          { fieldId: "3", fieldName: "Ширина междурядья", sensorId: null, type: "execution", value: "15" },
          { fieldId: "4", fieldName: "Глубина посадки", sensorId: "depth", type: "execution", value: "5" },
          { fieldId: "5", fieldName: "Скорость движения", sensorId: "speed", type: "execution", value: "8" },
        ]
      }
    ]
  }
];

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>(initialCrops);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [viewingCrop, setViewingCrop] = useState<Crop | null>(null);
  
  const [newCrop, setNewCrop] = useState<Crop>({
    id: "",
    name: "",
    variety: "",
    operations: []
  });

  const [selectedOperationId, setSelectedOperationId] = useState<string>("");
  const [currentOperationFields, setCurrentOperationFields] = useState<CropOperationField[]>([]);

  const currentCrop = editingCrop || newCrop;
  const setCurrentCrop = editingCrop 
    ? (crop: Crop) => setEditingCrop(crop)
    : (crop: Crop) => setNewCrop(crop);

  const handleSelectOperation = (operationId: string) => {
    setSelectedOperationId(operationId);
    const operation = availableOperations.find(op => op.id === operationId);
    if (operation) {
      const fields: CropOperationField[] = operation.fields.map(f => ({
        fieldId: f.id,
        fieldName: f.name,
        sensorId: f.sensorId,
        type: f.type,
        value: ""
      }));
      setCurrentOperationFields(fields);
    }
  };

  const handleFieldValueChange = (fieldId: string, value: string) => {
    setCurrentOperationFields(prev => 
      prev.map(f => f.fieldId === fieldId ? { ...f, value } : f)
    );
  };

  const handleAddOperation = () => {
    const operation = availableOperations.find(op => op.id === selectedOperationId);
    if (!operation) return;

    const cropOperation: CropOperation = {
      operationId: operation.id,
      operationName: operation.name,
      fields: currentOperationFields
    };

    setCurrentCrop({
      ...currentCrop,
      operations: [...currentCrop.operations, cropOperation]
    });

    setSelectedOperationId("");
    setCurrentOperationFields([]);
  };

  const handleRemoveOperation = (operationId: string) => {
    setCurrentCrop({
      ...currentCrop,
      operations: currentCrop.operations.filter(op => op.operationId !== operationId)
    });
  };

  const handleSaveCrop = () => {
    if (editingCrop) {
      setCrops(crops.map(c => c.id === editingCrop.id ? editingCrop : c));
      setEditingCrop(null);
    } else {
      const crop = {
        ...newCrop,
        id: Date.now().toString()
      };
      setCrops([...crops, crop]);
      setNewCrop({ id: "", name: "", variety: "", operations: [] });
    }
    setIsDialogOpen(false);
    setSelectedOperationId("");
    setCurrentOperationFields([]);
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setIsDialogOpen(true);
  };

  const handleDeleteCrop = (cropId: string) => {
    setCrops(crops.filter(c => c.id !== cropId));
  };

  const getSensorInfo = (sensorId: string | null) => {
    return sensors.find(s => s.id === sensorId);
  };

  const renderFieldInput = (field: CropOperationField) => {
    const sensor = getSensorInfo(field.sensorId);
    const SensorIcon = sensor?.icon || Activity;

    return (
      <div key={field.fieldId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
        <div className={`p-2 rounded-lg ${field.type === 'start_condition' ? 'bg-amber-500/20 text-amber-600' : 'bg-blue-500/20 text-blue-600'}`}>
          <SensorIcon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <Label className="text-sm font-medium">{field.fieldName}</Label>
          {sensor && (
            <p className="text-xs text-muted-foreground">Датчик: {sensor.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="w-24"
            placeholder="Значение"
            value={field.value}
            onChange={(e) => handleFieldValueChange(field.fieldId, e.target.value)}
          />
          {sensor && <span className="text-sm text-muted-foreground">{sensor.unit}</span>}
        </div>
      </div>
    );
  };

  const renderOperationCard = (operation: CropOperation, isEditing: boolean = false) => {
    const startConditions = operation.fields.filter(f => f.type === "start_condition");
    const executionFields = operation.fields.filter(f => f.type === "execution");

    return (
      <Card key={operation.operationId} className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{operation.operationName}</CardTitle>
            {isEditing && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleRemoveOperation(operation.operationId)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {startConditions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-600">Условия старта</span>
              </div>
              <div className="space-y-2">
                {startConditions.map(field => {
                  const sensor = getSensorInfo(field.sensorId);
                  return (
                    <div key={field.fieldId} className="flex items-center justify-between text-sm px-3 py-2 bg-amber-50 dark:bg-amber-950/20 rounded">
                      <span>{field.fieldName}</span>
                      <span className="font-medium">{field.value} {sensor?.unit || ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {executionFields.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Индикаторы выполнения</span>
              </div>
              <div className="space-y-2">
                {executionFields.map(field => {
                  const sensor = getSensorInfo(field.sensorId);
                  return (
                    <div key={field.fieldId} className="flex items-center justify-between text-sm px-3 py-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                      <span>{field.fieldName}</span>
                      <span className="font-medium">{field.value} {sensor?.unit || ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Культуры</h1>
            <p className="text-muted-foreground">
              Управление культурами и их агро-операциями
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingCrop(null);
              setNewCrop({ id: "", name: "", variety: "", operations: [] });
              setSelectedOperationId("");
              setCurrentOperationFields([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Добавить культуру
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCrop ? "Редактирование культуры" : "Новая культура"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Основная информация */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="crop-name">Название культуры</Label>
                    <Input
                      id="crop-name"
                      placeholder="Например: Пшеница, Кукуруза..."
                      value={currentCrop.name}
                      onChange={(e) => setCurrentCrop({ ...currentCrop, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crop-variety">Сорт</Label>
                    <Input
                      id="crop-variety"
                      placeholder="Например: Безостая 100"
                      value={currentCrop.variety}
                      onChange={(e) => setCurrentCrop({ ...currentCrop, variety: e.target.value })}
                    />
                  </div>
                </div>

                {/* Добавленные операции */}
                {currentCrop.operations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Добавленные операции</h3>
                    <div className="grid gap-4">
                      {currentCrop.operations.map(op => renderOperationCard(op, true))}
                    </div>
                  </div>
                )}

                {/* Добавление операции */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Добавить агро-операцию</CardTitle>
                    <CardDescription>
                      Выберите операцию и заполните показатели
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Выберите операцию</Label>
                      <Select
                        value={selectedOperationId}
                        onValueChange={handleSelectOperation}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите агро-операцию" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOperations
                            .filter(op => !currentCrop.operations.some(co => co.operationId === op.id))
                            .map(op => (
                              <SelectItem key={op.id} value={op.id}>
                                {op.name} - {op.description}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedOperationId && currentOperationFields.length > 0 && (
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

                        <TabsContent value="start_condition" className="space-y-3 mt-4">
                          {currentOperationFields
                            .filter(f => f.type === "start_condition")
                            .map(field => renderFieldInput(field))}
                          {currentOperationFields.filter(f => f.type === "start_condition").length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Нет условий старта для этой операции
                            </p>
                          )}
                        </TabsContent>

                        <TabsContent value="execution" className="space-y-3 mt-4">
                          {currentOperationFields
                            .filter(f => f.type === "execution")
                            .map(field => renderFieldInput(field))}
                          {currentOperationFields.filter(f => f.type === "execution").length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Нет индикаторов выполнения для этой операции
                            </p>
                          )}
                        </TabsContent>
                      </Tabs>
                    )}

                    {selectedOperationId && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleAddOperation}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить операцию к культуре
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveCrop} disabled={!currentCrop.name}>
                  {editingCrop ? "Сохранить" : "Создать культуру"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Просмотр культуры */}
        <Dialog open={!!viewingCrop} onOpenChange={(open) => !open && setViewingCrop(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                {viewingCrop?.name}
              </DialogTitle>
            </DialogHeader>
            {viewingCrop && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Сорт: {viewingCrop.variety}</Badge>
                  <Badge variant="outline">{viewingCrop.operations.length} операций</Badge>
                </div>
                <div className="grid gap-4">
                  {viewingCrop.operations.map(op => renderOperationCard(op))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Список культур */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {crops.map(crop => (
            <Card key={crop.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wheat className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{crop.name}</CardTitle>
                      <CardDescription>{crop.variety}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {crop.operations.length} операций
                    </Badge>
                  </div>
                  
                  {crop.operations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {crop.operations.map(op => (
                        <Badge key={op.operationId} variant="outline" className="text-xs">
                          {op.operationName}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setViewingCrop(crop)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Просмотр
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCrop(crop)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCrop(crop.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {crops.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Wheat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет добавленных культур</h3>
              <p className="text-muted-foreground mb-4">
                Добавьте первую культуру и настройте агро-операции
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить культуру
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
