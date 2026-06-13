import React, { useState, useEffect } from "react";
import { Product, InventoryTransaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Plus,
  Scan,
  Upload,
  FileText
} from "lucide-react";

import StatsOverview from "../components/dashboard/StatsOverview";
import LowStockAlert from "../components/dashboard/LowStockAlert";
import SyncStatusCard from "../components/dashboard/SyncStatusCard";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import ChannelBreakdown from "../components/dashboard/ChannelBreakdown";

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, transactionsData] = await Promise.all([
        Product.list('-updated_date'),
        InventoryTransaction.list('-created_date', 10)
      ]);
      setProducts(productsData);
      setTransactions(transactionsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const lowStockProducts = products.filter(p => p.current_stock <= (p.minimum_stock || 5));
  const syncIssues = products.filter(p => 
    p.shopify_sync_status === 'error' || 
    p.amazon_sync_status === 'error' || 
    p.ebay_sync_status === 'error'
  );

  const totalValue = products.reduce((sum, p) => sum + ((p.current_stock || 0) * (p.cost_price || 0)), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Monitor stock levels across all your sales channels
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto flex-wrap">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to={createPageUrl("BarcodeScanner")} className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full">
                <Scan className="w-4 h-4 mr-2" />
                Scanner
              </Button>
            </Link>
            <Link to={createPageUrl("BulkImport")} className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </Link>
            <Link to={createPageUrl("Reports")} className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Link to={createPageUrl("Products?action=add")} className="flex-1 md:flex-none">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Last refresh indicator */}
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsOverview
            title="Total Products"
            value={products.length}
            icon={Package}
            color="blue"
            trend={products.length > 0 ? "Click to view all" : "Start adding products"}
            onClick={() => navigate(createPageUrl("Products"))}
          />
          <StatsOverview
            title="Low Stock Items"
            value={lowStockProducts.length}
            icon={AlertTriangle}
            color={lowStockProducts.length > 0 ? "orange" : "green"}
            trend={lowStockProducts.length > 0 ? "Click to view" : "All good!"}
            onClick={lowStockProducts.length > 0 ? () => navigate(createPageUrl("Products?filter=lowstock")) : undefined}
          />
          <StatsOverview
            title="Sync Issues"
            value={syncIssues.length}
            icon={RefreshCw}
            color={syncIssues.length > 0 ? "red" : "green"}
            trend={syncIssues.length > 0 ? "Click to resolve" : "All synced"}
            onClick={syncIssues.length > 0 ? () => navigate(createPageUrl("Products?filter=syncissues")) : undefined}
          />
          <StatsOverview
            title="Inventory Value"
            value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="green"
            trend="View analytics"
            onClick={() => navigate(createPageUrl("Analytics"))}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <LowStockAlert products={lowStockProducts} isLoading={isLoading} />
            <RecentTransactions transactions={transactions} isLoading={isLoading} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <SyncStatusCard products={products} isLoading={isLoading} />
            <ChannelBreakdown products={products} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}