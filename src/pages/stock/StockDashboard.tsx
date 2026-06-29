import { useMemo } from "react";
import {
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineShoppingBag,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui";
import { useGetGeneralStockItemsQuery, useGetGeneralStockSortiesQuery } from "../../store/services/generalStockService";
import { useGetBoutiqueStockItemsQuery, useGetBoutiqueStockSortiesQuery } from "../../store/services/boutiqueStockService";

export default function StockDashboard() {
  const navigate = useNavigate();

  // ── General stock ──────────────────────────────────────────────────────────
  const { data: gItemsData, isLoading: loadingGItems, refetch: r1 } =
    useGetGeneralStockItemsQuery({ limit: 500 });
  const { data: gSortiesData, isLoading: loadingGSorties, refetch: r2 } =
    useGetGeneralStockSortiesQuery({ limit: 500 });

  // ── Boutique stock ─────────────────────────────────────────────────────────
  const { data: bItemsData, isLoading: loadingBItems, refetch: r3 } =
    useGetBoutiqueStockItemsQuery({ limit: 500 });
  const { data: bSortiesData, isLoading: loadingBSorties, refetch: r4 } =
    useGetBoutiqueStockSortiesQuery({ limit: 500 });

  const refetch = () => { r1(); r2(); r3(); r4(); };
  const isLoading = loadingGItems || loadingGSorties || loadingBItems || loadingBSorties;

  // ── Derived values ─────────────────────────────────────────────────────────
  const gItems   = gItemsData?.data ?? [];
  const gSorties = gSortiesData?.data ?? [];
  const bItems   = bItemsData?.data ?? [];
  const bSorties = bSortiesData?.data ?? [];

  const lowStockCount = useMemo(
    () => [...gItems, ...bItems].filter((i) => i.stockStatus === "low" || i.stockStatus === "out-of-stock").length,
    [gItems, bItems]
  );

  // ── KPI definitions ────────────────────────────────────────────────────────
  const kpis = [
    {
      label:   "General Stock",
      value:   gItems.length,
      icon:    HiOutlineCube,
      color:   "text-primary-500",
      bg:      "bg-primary-100",
      ring:    "hover:ring-primary-400",
      path:    "/stock/general-stock",
      loading: loadingGItems,
    },
    {
      label:   "Boutique Stock",
      value:   bItems.length,
      icon:    HiOutlineShoppingBag,
      color:   "text-indigo-600",
      bg:      "bg-indigo-100",
      ring:    "hover:ring-indigo-400",
      path:    "/stock/boutique-stock",
      loading: loadingBItems,
    },
    {
      label:   "Low / Out of Stock",
      value:   lowStockCount,
      icon:    HiOutlineExclamationCircle,
      color:   "text-red-500",
      bg:      "bg-red-100",
      ring:    "hover:ring-red-400",
      path:    "/stock/general-stock",
      loading: loadingGItems || loadingBItems,
    },

  ];

  // ── Low-stock items list (top 5 across both stocks) ────────────────────────
  const lowItems = useMemo(
    () =>
      [...gItems, ...bItems]
        .filter((i) => i.stockStatus === "low" || i.stockStatus === "out-of-stock")
        .slice(0, 6),
    [gItems, bItems]
  );

  return (
    <div className="space-y-8 font-[family-name:var(--font-family-primary)]">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
            Stock Department Dashboard
          </h1>
          <p className="text-sm text-custom-700 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-custom-300 hover:bg-custom-100 transition-colors text-custom-700 text-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, bg, ring, path, loading }) => (
          <Card
            key={label}
            className={`!p-4 flex flex-col gap-3 cursor-pointer hover:ring-2 transition-all ${ring}`}
            onClick={() => navigate(path)}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-custom-700">{label}</p>
              {loading ? (
                <div className="h-7 w-12 bg-custom-200 rounded animate-pulse mt-1" />
              ) : (
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Stock sections row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* General Stock */}
        <Card
          className="cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
          onClick={() => navigate("/stock/general-stock")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineCube className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">General Stock</h2>
            </div>
            <span className="text-xs font-semibold text-primary-500">Manage →</span>
          </div>
          {loadingGItems ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-custom-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {[
                { label: "Total Items",     value: gItems.length,                                               cls: "text-secondary-100" },
                { label: "Available",       value: gItems.filter(i => i.stockStatus === "available").length,   cls: "text-green-600" },
                { label: "Low Stock",       value: gItems.filter(i => i.stockStatus === "low").length,         cls: "text-yellow-600" },
                { label: "Out of Stock",    value: gItems.filter(i => i.stockStatus === "out-of-stock").length, cls: "text-red-500" },
                { label: "Pending Sorties", value: gSorties.filter(s => s.status === "pending").length,        cls: "text-yellow-600" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between items-center px-3 py-2 rounded-lg bg-custom-50 border border-custom-200">
                  <span className="text-xs text-custom-700">{label}</span>
                  <span className={`text-sm font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Boutique Stock */}
        <Card
          className="cursor-pointer hover:ring-2 hover:ring-primary-400 transition-all"
          onClick={() => navigate("/stock/boutique-stock")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineShoppingBag className="w-5 h-5 text-primary-500" />
              <h2 className="font-bold text-secondary-100">Boutique Stock</h2>
            </div>
            <span className="text-xs font-semibold text-primary-500">Manage →</span>
          </div>
          {loadingBItems ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-custom-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {[
                { label: "Total Items",     value: bItems.length,                                               cls: "text-secondary-100" },
                { label: "Available",       value: bItems.filter(i => i.stockStatus === "available").length,   cls: "text-green-600" },
                { label: "Low Stock",       value: bItems.filter(i => i.stockStatus === "low").length,         cls: "text-yellow-600" },
                { label: "Out of Stock",    value: bItems.filter(i => i.stockStatus === "out-of-stock").length, cls: "text-red-500" },
                { label: "Pending Sorties", value: bSorties.filter(s => s.status === "pending").length,        cls: "text-yellow-600" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="flex justify-between items-center px-3 py-2 rounded-lg bg-custom-50 border border-custom-200">
                  <span className="text-xs text-custom-700">{label}</span>
                  <span className={`text-sm font-bold ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Low / Out-of-stock alert */}
      {!isLoading && lowItems.length > 0 && (
        <Card
          className="cursor-pointer hover:ring-2 hover:ring-red-400 transition-all"
          onClick={() => navigate("/stock/general-stock")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-secondary-100">Needs Restocking</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{lowItems.length}</span>
            </div>
            <span className="text-xs font-semibold text-red-500">View all →</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-red-200 bg-red-50">
                <div>
                  <p className="text-sm font-semibold text-secondary-100 truncate max-w-[120px]">{item.itemName}</p>
                  <p className="text-xs text-custom-700">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.stockStatus === "out-of-stock" ? "text-red-600" : "text-yellow-600"}`}>
                    {item.currentStock} {item.unit}
                  </p>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.stockStatus === "out-of-stock" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {item.stockStatus === "out-of-stock" ? "Out" : "Low"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}
