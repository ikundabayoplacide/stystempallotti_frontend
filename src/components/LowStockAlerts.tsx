import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineExclamationCircle } from "react-icons/hi";
import { Card } from "./ui";
import { useState } from "react";

interface StockItem {
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  level: "critical" | "low" | "normal";
}

const stockItems: StockItem[] = [
  { name: "A4 Paper (80gsm)", currentStock: 50, minStock: 200, unit: "reams", level: "critical" },
  { name: "Black Ink Cartridge", currentStock: 2, minStock: 10, unit: "units", level: "critical" },
  { name: "Binding Wire", currentStock: 15, minStock: 30, unit: "rolls", level: "low" },

];

export default function LowStockAlerts() {
  const [showAll, setShowAll] = useState(false);
  const criticalItems = stockItems.filter((item) => item.level === "critical");

  const displayedItems = showAll ? stockItems : stockItems.slice(0, 3);
  const hasMore = stockItems.length > 3;

  return (
    <Card className="h-fit">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
        <h2 className="font-bold text-secondary-100">Low Stock Alerts</h2>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
          {criticalItems.length} Critical
        </span>
      </div>
      <div className="space-y-2">
        {displayedItems.map((item) => (
          <div
            key={item.name}
            className={`p-3 rounded-xl border-2 transition-all ${
              item.level === "critical"
                ? "border-red-300 bg-red-50"
                : "border-orange-300 bg-orange-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-secondary-100">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-custom-700">
                    Current: <span className="font-bold">{item.currentStock}</span> {item.unit}
                  </span>
                  <span className="text-xs text-custom-700">•</span>
                  <span className="text-xs text-custom-700">
                    Min: {item.minStock} {item.unit}
                  </span>
                </div>
                <div className="mt-2 w-full bg-custom-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.level === "critical" ? "bg-red-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${(item.currentStock / item.minStock) * 100}%` }}
                  />
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  item.level === "critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {item.level === "critical" ? "Critical" : "Low"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 px-4 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-sm font-semibold text-custom-700 flex items-center justify-center gap-2"
        >
          {showAll ? (
            <>
              Show Less
              <HiOutlineChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show More ({stockItems.length - 4} more)
              <HiOutlineChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </Card>
  );
}
