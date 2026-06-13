import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Package, RefreshCw, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const transactionIcons = {
  sale: TrendingDown,
  restock: TrendingUp,
  adjustment: RefreshCw,
  return: TrendingUp,
  damage: TrendingDown
};

const transactionColors = {
  sale: "bg-red-100 text-red-800",
  restock: "bg-green-100 text-green-800", 
  adjustment: "bg-blue-100 text-blue-800",
  return: "bg-yellow-100 text-yellow-800",
  damage: "bg-orange-100 text-orange-800"
};

export default function RecentTransactions({ transactions, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No transactions yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Inventory changes will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const Icon = transactionIcons[transaction.transaction_type] || Package;
            const colorClass = transactionColors[transaction.transaction_type] || "bg-gray-100 text-gray-800";

            return (
              <Link key={transaction.id} to={createPageUrl("Products")} className="block">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-all cursor-pointer hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClass.replace('text-', 'text-').replace('bg-', 'bg-').replace('800', '100')}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{transaction.channel || 'Manual'}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.created_date), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <Badge variant="outline" className={colorClass}>
                        {transaction.quantity_change > 0 ? '+' : ''}{transaction.quantity_change}
                      </Badge>
                      {transaction.unit_price && (
                        <p className="text-xs text-slate-500 mt-1">
                          ${(transaction.unit_price * Math.abs(transaction.quantity_change)).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}