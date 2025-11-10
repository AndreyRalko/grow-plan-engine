import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

export default function WeatherWidget() {
  const weatherData = [
    { day: "Пн", temp: "22°", icon: Sun },
    { day: "Вт", temp: "19°", icon: CloudRain },
    { day: "Ср", temp: "21°", icon: Cloud },
    { day: "Чт", temp: "23°", icon: Sun },
    { day: "Пт", temp: "20°", icon: Cloud },
  ];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wind className="h-5 w-5 text-sky" />
          <span>Прогноз погоды</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center space-x-4">
          {weatherData.map((day, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <span className="text-sm text-muted-foreground">{day.day}</span>
              <div className="bg-sky/10 p-3 rounded-lg">
                <day.icon className="h-6 w-6 text-sky" />
              </div>
              <span className="text-sm font-medium">{day.temp}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Влажность</p>
              <p className="font-medium">65%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ветер</p>
              <p className="font-medium">12 км/ч</p>
            </div>
            <div>
              <p className="text-muted-foreground">Давление</p>
              <p className="font-medium">1013 мбар</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
