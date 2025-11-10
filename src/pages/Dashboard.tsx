import Layout from "@/components/Layout";
import StatsCard from "@/components/dashboard/StatsCard";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import FieldsMap from "@/components/dashboard/FieldsMap";
import { Tractor, Users, Beef, MapPin } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Дашборд</h1>
          <p className="text-muted-foreground">Обзор состояния предприятия</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Всего полей"
            value="5"
            icon={MapPin}
            trend="+1 в этом месяце"
            trendUp={true}
          />
          <StatsCard
            title="Сотрудников"
            value="24"
            icon={Users}
            trend="+2 новых"
            trendUp={true}
          />
          <StatsCard
            title="Единиц техники"
            value="12"
            icon={Tractor}
            trend="Все в работе"
            trendUp={true}
          />
          <StatsCard
            title="Голов скота"
            value="156"
            icon={Beef}
            trend="+8 с прошлого месяца"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FieldsMap />
          </div>
          <div>
            <WeatherWidget />
          </div>
        </div>
      </div>
    </Layout>
  );
}
