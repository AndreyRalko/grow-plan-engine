import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function FieldsMap() {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Map className="h-5 w-5 text-primary" />
          <span>Карта полей</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] bg-gradient-to-br from-secondary via-primary/5 to-accent/5 rounded-lg overflow-hidden">
          {/* Simplified map representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 600 400" className="w-full h-full">
              {/* Field polygons */}
              <polygon
                points="50,50 200,50 200,180 50,180"
                className="fill-primary/20 stroke-primary stroke-2 hover:fill-primary/30 transition-all cursor-pointer"
              />
              <text x="125" y="115" className="fill-primary text-sm font-medium" textAnchor="middle">
                Поле №1
              </text>
              
              <polygon
                points="220,50 380,50 380,180 220,180"
                className="fill-accent/20 stroke-accent stroke-2 hover:fill-accent/30 transition-all cursor-pointer"
              />
              <text x="300" y="115" className="fill-accent text-sm font-medium" textAnchor="middle">
                Поле №2
              </text>
              
              <polygon
                points="400,50 550,50 550,180 400,180"
                className="fill-earth/20 stroke-earth stroke-2 hover:fill-earth/30 transition-all cursor-pointer"
              />
              <text x="475" y="115" className="fill-earth text-sm font-medium" textAnchor="middle">
                Поле №3
              </text>
              
              <polygon
                points="50,200 200,200 200,350 50,350"
                className="fill-primary/20 stroke-primary stroke-2 hover:fill-primary/30 transition-all cursor-pointer"
              />
              <text x="125" y="275" className="fill-primary text-sm font-medium" textAnchor="middle">
                Поле №4
              </text>
              
              <polygon
                points="220,200 550,200 550,350 220,350"
                className="fill-accent/20 stroke-accent stroke-2 hover:fill-accent/30 transition-all cursor-pointer"
              />
              <text x="385" y="275" className="fill-accent text-sm font-medium" textAnchor="middle">
                Поле №5
              </text>
            </svg>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-primary/40 rounded"></div>
              <span>Посеяно</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-accent/40 rounded"></div>
              <span>В обработке</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-4 h-4 bg-earth/40 rounded"></div>
              <span>Готово к посеву</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
