import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChannelBreakdown({ products, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Channel Stock Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Shopify", "Amazon", "eBay"].map((channel) => (
              <div key={channel} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const channelData = [
    {
      name: 'Shopify',
      key: 'shopify_stock',
      color: 'bg-green-500',
      icon: '🛒'
    },
    {
      name: 'Amazon', 
      key: 'amazon_stock',
      color: 'bg-orange-500',
      icon: '📦'
    },
    {
      name: 'eBay',
      key: 'ebay_stock', 
      color: 'bg-blue-500',
      icon: '🏪'
    }
  ];

  const getChannelTotals = () => {
    return channelData.map(channel => ({
      ...channel,
      total: products.reduce((sum, product) => sum + (product[channel.key] || 0), 0)
    }));
  };

  const channelTotals = getChannelTotals();
  const grandTotal = channelTotals.reduce((sum, channel) => sum + channel.total, 0);

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Channel Stock Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channelTotals.map((channel) => {
            const percentage = grandTotal > 0 ? (channel.total / grandTotal) * 100 : 0;
            
            return (
              <div key={channel.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{channel.icon}</span>
                    <span className="font-medium text-slate-900">{channel.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700">
                    {channel.total} units
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${channel.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-right">
                  {percentage.toFixed(1)}% of total inventory
                </p>
              </div>
            );
          })}
          
          {grandTotal === 0 && (
            <div className="text-center py-6">
              <p className="text-slate-500">No stock allocated to channels yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}