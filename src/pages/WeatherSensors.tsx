import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Gauge,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WeatherLocation {
  id: number;
  name: string;
  lat: string;
  lon: string;
}

interface WeatherRecord {
  id: number;
  locationId: number;
  locationName: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipProbability: number;
  precipAmount: number;
  activeTemperatureSum: number;
}

const initialLocations: WeatherLocation[] = [
  { id: 1, name: "Поле №1 — Северное", lat: "52.2855", lon: "104.2890" },
  { id: 2, name: "Поле №3 — Южное", lat: "52.2710", lon: "104.3015" },
];

const generateMockData = (locations: WeatherLocation[]): WeatherRecord[] => {
  const records: WeatherRecord[] = [];
  let id = 1;
  const now = new Date();

  locations.forEach((loc) => {
    for (let h = 0; h < 12; h++) {
      const time = new Date(now.getTime() - h * 3600000);
      const baseTemp = 18 + Math.random() * 10 - 5;
      records.push({
        id: id++,
        locationId: loc.id,
        locationName: loc.name,
        timestamp: time.toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(55 + Math.random() * 30),
        windSpeed: Math.round((2 + Math.random() * 8) * 10) / 10,
        pressure: Math.round(740 + Math.random() * 30),
        precipProbability: Math.round(Math.random() * 100),
        precipAmount: Math.round(Math.random() * 5 * 10) / 10,
        activeTemperatureSum: Math.round((800 + h * 12 + Math.random() * 50) * 10) / 10,
      });
    }
  });

  return records.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export default function WeatherSensors() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState("60");
  const [locations, setLocations] = useState<WeatherLocation[]>(initialLocations);
  const [records] = useState<WeatherRecord[]>(() => generateMockData(initialLocations));
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", lat: "", lon: "" });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lon) return;
    setLocations((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newLocation.name,
        lat: newLocation.lat,
        lon: newLocation.lon,
      },
    ]);
    setNewLocation({ name: "", lat: "", lon: "" });
    setAddLocationOpen(false);
  };

  const handleRemoveLocation = (id: number) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/integrations")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-1 flex items-center gap-3">
              <Thermometer className="h-8 w-8 text-primary" />
              Погодные датчики
            </h1>
            <p className="text-muted-foreground">
              Мониторинг погодных условий в реальном времени
            </p>
          </div>
        </div>

        {/* Frequency & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Периодичность запросов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Каждые 15 минут</SelectItem>
                  <SelectItem value="30">Каждые 30 минут</SelectItem>
                  <SelectItem value="60">Каждый час</SelectItem>
                  <SelectItem value="180">Каждые 3 часа</SelectItem>
                  <SelectItem value="360">Каждые 6 часов</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                Статус
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  Активно
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Последний запрос: 5 мин. назад
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Локации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-foreground">{locations.length}</span>
              <span className="text-sm text-muted-foreground ml-2">точек наблюдения</span>
            </CardContent>
          </Card>
        </div>

        {/* Locations */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Локации запросов
              </CardTitle>
              <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить локацию</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        placeholder="Например: Поле №5"
                        value={newLocation.name}
                        onChange={(e) =>
                          setNewLocation((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Широта</Label>
                        <Input
                          placeholder="52.2855"
                          value={newLocation.lat}
                          onChange={(e) =>
                            setNewLocation((prev) => ({ ...prev, lat: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Долгота</Label>
                        <Input
                          placeholder="104.2890"
                          value={newLocation.lon}
                          onChange={(e) =>
                            setNewLocation((prev) => ({ ...prev, lon: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddLocation} className="w-full">
                      Добавить локацию
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{loc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {loc.lat}°N, {loc.lon}°E
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLocation(loc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {locations.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Нет добавленных локаций
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weather Data Table */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Полученные данные</CardTitle>
              <Badge variant="secondary">{records.length} записей</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[160px]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Локация
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Время
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" /> °C
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" /> Влажн.%
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <Wind className="h-3.5 w-3.5" /> Ветер м/с
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[90px]">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5" /> Давл. мм
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[90px]">
                      <div className="flex items-center gap-1">
                        <CloudRain className="h-3.5 w-3.5" /> Осадки %
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[90px]">Осадки мм/ч</TableHead>
                    <TableHead className="min-w-[90px]">САТ °C</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.locationName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.timestamp}</TableCell>
                      <TableCell>{r.temperature}</TableCell>
                      <TableCell>{r.humidity}</TableCell>
                      <TableCell>{r.windSpeed}</TableCell>
                      <TableCell>{r.pressure}</TableCell>
                      <TableCell>{r.precipProbability}</TableCell>
                      <TableCell>{r.precipAmount}</TableCell>
                      <TableCell>{r.activeTemperatureSum}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
