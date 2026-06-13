import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, DollarSign, ShoppingCart, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    loadData();
  }, [timeRange]);

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

  // Sales by channel
  const getSalesByChannel = () => {
    const channelData = {};
    transactions.filter(t => t.transaction_type === 'sale').forEach(t => {
      channelData[t.channel] = (channelData[t.channel] || 0) + Math.abs(t.quantity_change);
    });
    return Object.entries(channelData).map(([name, value]) => ({ name, value }));
  };

  // Revenue over time
  const getRevenueOverTime = () => {
    const days = parseInt(timeRange);
    const revenueByDay = {};
    const startDate = startOfDay(subDays(new Date(), days));
    
    transactions.filter(t => t.transaction_type === 'sale' && new Date(t.created_date) >= startDate)
      .forEach(t => {
        const day = format(new Date(t.created_date), 'MMM dd');
        revenueByDay[day] = (revenueByDay[day] || 0) + (Math.abs(t.quantity_change) * (t.unit_price || 0));
      });

    return Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));
  };

  // Top selling products
  const getTopProducts = () => {
    return products
      .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
      .slice(0, 10)
      .map(p => ({ name: p.name, sold: p.total_sold || 0 }));
  };

  // Category distribution
  const getCategoryDistribution = () => {
    const categoryCount = {};
    products.forEach(p => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  // Inventory value by category
  const getInventoryValueByCategory = () => {
    const categoryValue = {};
    products.forEach(p => {
      const value = (p.current_stock || 0) * (p.cost_price || 0);
      categoryValue[p.category] = (categoryValue[p.category] || 0) + value;
    });
    return Object.entries(categoryValue).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value: Math.round(value) 
    }));
  };

  const totalRevenue = transactions
    .filter(t => t.transaction_type === 'sale')
    .reduce((sum, t) => sum + (Math.abs(t.quantity_change) * (t.unit_price || 0)), 0);

  const totalSold = transactions
    .filter(t => t.transaction_type === 'sale')
    .reduce((sum, t) => sum + Math.abs(t.quantity_change), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
            <p className="text-slate-600 mt-1">Track performance and make data-driven decisions</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Units Sold</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalSold}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Products</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${transactions.filter(t => t.transaction_type === 'sale').length > 0 
                      ? (totalRevenue / transactions.filter(t => t.transaction_type === 'sale').length).toFixed(2) 
                      : '0'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={getRevenueOverTime()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Sales by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={getSalesByChannel()} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                        {getSalesByChannel().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={getCategoryDistribution()} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                        {getCategoryDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getTopProducts()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sold" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getInventoryValueByCategory()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}