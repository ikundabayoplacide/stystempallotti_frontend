import { useState } from "react";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineExclamationCircle } from "react-icons/hi";
import { Card } from "./ui";
import { useGetStockItemsQuery } from "../store/services/stockService";

export default function LowStockAlerts() {
  const [showAll, setShowAll] = useState(false);
  const { data } = useGetStockItemsQuery({ limit: 100 });

  const stockItems = (data?.data ?? []).filter(
    (item) => item.stockStatus === "low" || item.stockStatus === "out-of-stock"
  );

  const criticalCount = stockItems.filter((i) => i.stockStatus === "out-of-stock").length;
  const displayed = showAll ? stockItems : stockItems.slice(0, 3);

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
        <h2 className="font-bold text-secondary-100">Low Stock Alerts</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
          {criticalCount} Critical
        </span>
      </div>
      <div className="space-y-2">
        {stockItems.length === 0 && <p className="text-sm text-custom-700 text-center py-4">All stock levels are healthy</p>}
        {displayed.map((item) => {
          const isCritical = item.stockStatus === "out-of-stock";
          const minStock = item.alarmStock ?? item.minStock ?? 1;
          const pct = Math.min(100, (item.currentStock / minStock) * 100);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border-2 transition-all ${isCritical ? "border-red-300 bg-red-50" : "border-orange-300 bg-orange-50"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-secondary-100">{item.itemName ?? item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-custom-700">Current: <span className="font-bold">{item.currentStock}</span> {item.unit}</span>
                    <span className="text-xs text-custom-700">•</span>
                    <span className="text-xs text-custom-700">Min: {minStock} {item.unit}</span>
                  </div>
                  <div className="mt-2 w-full bg-custom-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isCritical ? "bg-red-500" : "bg-orange-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCritical ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                  {isCritical ? "Critical" : "Low"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {stockItems.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? <><span>Show Less</span><HiOutlineChevronUp className="w-4 h-4" /></> : <><span>Show More ({stockItems.length - 3} more)</span><HiOutlineChevronDown className="w-4 h-4" /></>}
        </button>
      )}
    </Card>
  );
}
