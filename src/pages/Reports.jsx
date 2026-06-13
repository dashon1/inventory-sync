import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default function Reports() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reportType, setReportType] = useState("inventory");
  const [dateRange, setDateRange] = useState("month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, transactionsData] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.InventoryTransaction.list('-created_date', 1000)
      ]);
      setProducts(productsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        return subDays(now, 7);
      case "month":
        return startOfMonth(now);
      case "quarter":
        return subMonths(now, 3);
      case "year":
        return subMonths(now, 12);
      default:
        return startOfMonth(now);
    }
  };

  const generateInventoryReport = () => {
    const report = products.map(p => ({
      "Product Name": p.name,
      "SKU": p.sku,
      "Category": p.category,
      "Current Stock": p.current_stock,
      "Minimum Stock": p.minimum_stock || 0,
      "Reorder Point": p.reorder_point || 0,
      "Cost Price": p.cost_price || 0,
      "Selling Price": p.selling_price || 0,
      "Total Value": (p.current_stock * (p.cost_price || 0)).toFixed(2),
      "Shopify Stock": p.shopify_stock || 0,
      "Amazon Stock": p.amazon_stock || 0,
      "eBay Stock": p.ebay_stock || 0,
      "Status": p.status || "active"
    }));
    return report;
  };

  const generateSalesReport = () => {
    const startDate = getDateRangeFilter();
    const salesTransactions = transactions.filter(t => 
      t.transaction_type === 'sale' && new Date(t.created_date) >= startDate
    );

    const reportData = {};
    salesTransactions.forEach(t => {
      if (!reportData[t.product_id]) {
        const product = products.find(p => p.id === t.product_id);
        reportData[t.product_id] = {
          "Product Name": product?.name || "Unknown",
          "SKU": product?.sku || "N/A",
          "Units Sold": 0,
          "Revenue": 0,
          "Channel Breakdown": {}
        };
      }
      reportData[t.product_id]["Units Sold"] += Math.abs(t.quantity_change);
      reportData[t.product_id]["Revenue"] += Math.abs(t.quantity_change) * (t.unit_price || 0);
      reportData[t.product_id]["Channel Breakdown"][t.channel] = 
        (reportData[t.product_id]["Channel Breakdown"][t.channel] || 0) + Math.abs(t.quantity_change);
    });

    return Object.values(reportData).map(item => ({
      ...item,
      "Revenue": `$${item.Revenue.toFixed(2)}`,
      "Channel Breakdown": JSON.stringify(item["Channel Breakdown"])
    }));
  };

  const generateLowStockReport = () => {
    return products
      .filter(p => p.current_stock <= (p.reorder_point || p.minimum_stock || 5))
      .map(p => ({
        "Product Name": p.name,
        "SKU": p.sku,
        "Current Stock": p.current_stock,
        "Reorder Point": p.reorder_point || p.minimum_stock || 5,
        "Recommended Order": (p.reorder_quantity || 50),
        "Supplier": p.supplier_id || "Not Set",
        "Category": p.category
      }));
  };

  const generateTransactionReport = () => {
    const startDate = getDateRangeFilter();
    return transactions
      .filter(t => new Date(t.created_date) >= startDate)
      .map(t => {
        const product = products.find(p => p.id === t.product_id);
        return {
          "Date": format(new Date(t.created_date), 'yyyy-MM-dd HH:mm'),
          "Product": product?.name || "Unknown",
          "SKU": product?.sku || "N/A",
          "Type": t.transaction_type,
          "Channel": t.channel,
          "Quantity Change": t.quantity_change,
          "Unit Price": t.unit_price || 0,
          "Total Value": ((t.unit_price || 0) * Math.abs(t.quantity_change)).toFixed(2),
          "Reason": t.reason || ""
        };
      });
  };

  const downloadCSV = () => {
    let data = [];
    let filename = "";

    switch (reportType) {
      case "inventory":
        data = generateInventoryReport();
        filename = `inventory_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case "sales":
        data = generateSalesReport();
        filename = `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case "lowstock":
        data = generateLowStockReport();
        filename = `low_stock_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
      case "transactions":
        data = generateTransactionReport();
        filename = `transaction_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        break;
    }

    if (data.length === 0) {
      alert("No data available for this report");
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header]?.toString() || '';
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const reportTypes = [
    { value: "inventory", label: "Inventory Snapshot", description: "Current stock levels across all products" },
    { value: "sales", label: "Sales Performance", description: "Sales data and revenue by product" },
    { value: "lowstock", label: "Low Stock / Reorder", description: "Products that need restocking" },
    { value: "transactions", label: "Transaction History", description: "Complete transaction log" }
  ];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Export</h1>
          <p className="text-slate-600 mt-1">Generate and download detailed inventory reports</p>
        </div>

        {/* Report Configuration */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportType !== "inventory" && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">Last 3 Months</SelectItem>
                      <SelectItem value="year">Last 12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-1">
                {reportTypes.find(t => t.value === reportType)?.label}
              </h3>
              <p className="text-sm text-blue-700">
                {reportTypes.find(t => t.value === reportType)?.description}
              </p>
            </div>

            <Button onClick={downloadCSV} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV Report
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Report Date</p>
                  <p className="text-lg font-bold text-slate-900">{format(new Date(), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 border-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2">💡 Report Tips</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Inventory reports include all current stock levels and valuations</li>
              <li>• Sales reports show revenue and units sold by product</li>
              <li>• Low stock reports help you plan reorders efficiently</li>
              <li>• Transaction reports provide a complete audit trail</li>
              <li>• All reports can be opened in Excel or Google Sheets</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}