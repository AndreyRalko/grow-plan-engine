import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route } from "lucide-react";

export interface TransportPoint {
  name: string;
  lat: number;
  lng: number;
}

export function TransportMap({ from, to }: { from: TransportPoint; to: TransportPoint }) {
  const hasCoords = from.lat && from.lng && to.lat && to.lng;
  const project = (lat: number, lng: number) => {
    const lats = [from.lat, to.lat];
    const lngs = [from.lng, to.lng];
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padX = 60, padY = 40;
    const w = 400 - padX * 2, h = 200 - padY * 2;
    const dLat = maxLat - minLat || 1;
    const dLng = maxLng - minLng || 1;
    const x = padX + ((lng - minLng) / dLng) * w;
    const y = padY + (1 - (lat - minLat) / dLat) * h;
    return { x, y };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Route className="h-4 w-4 text-primary" />
          Маршрут на карте
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[220px] bg-gradient-to-br from-secondary via-primary/5 to-accent/5 rounded-lg overflow-hidden border">
          {hasCoords ? (
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#grid)" />
              {(() => {
                const a = project(from.lat, from.lng);
                const b = project(to.lat, to.lng);
                return (
                  <>
                    <line
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                    <circle cx={a.x} cy={a.y} r="8" fill="hsl(142 76% 36%)" stroke="white" strokeWidth="2" />
                    <text x={a.x} y={a.y - 12} textAnchor="middle" className="fill-foreground text-[10px] font-medium">
                      А: {from.name || "Начало"}
                    </text>
                    <circle cx={b.x} cy={b.y} r="8" fill="hsl(0 72% 51%)" stroke="white" strokeWidth="2" />
                    <text x={b.x} y={b.y - 12} textAnchor="middle" className="fill-foreground text-[10px] font-medium">
                      Б: {to.name || "Конец"}
                    </text>
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Введите координаты обеих точек, чтобы увидеть маршрут
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
