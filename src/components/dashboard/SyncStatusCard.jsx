import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle, Clock, XCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const channelIcons = {
  shopify: "🛒",
  amazon: "📦", 
  ebay: "🏪"
};

const statusConfigs = {
  synced: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Synced" },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" },
  error: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Error" },
  not_connected: { color: "bg-gray-100 text-gray-600", icon: AlertCircle, text: "Not Connected" }
};

export default function SyncStatusCard({ products, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Channel Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Shopify", "Amazon", "eBay"].map((channel) => (
              <div key={channel} className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChannelStatus = (channel) => {
    if (products.length === 0) return { synced: 0, pending: 0, error: 0, not_connected: 0 };
    
    const counts = { synced: 0, pending: 0, error: 0, not_connected: 0 };
    products.forEach(product => {
      const status = product[`${channel}_sync_status`] || 'not_connected';
      counts[status]++;
    });
    return counts;
  };

  const channels = ['shopify', 'amazon', 'ebay'];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Channel Sync Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channels.map((channel) => {
            const status = getChannelStatus(channel);
            const totalProducts = Object.values(status).reduce((sum, count) => sum + count, 0);
            const primaryStatus = status.error > 0 ? 'error' : 
                                 status.pending > 0 ? 'pending' : 
                                 status.synced > 0 ? 'synced' : 'not_connected';
            
            const config = statusConfigs[primaryStatus];
            const Icon = config.icon;

            return (
              <Link key={channel} to={createPageUrl("Products")} className="block">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-all cursor-pointer hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{channelIcons[channel]}</span>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{channel}</p>
                      <p className="text-xs text-slate-500">
                        {totalProducts} products
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <Badge variant="outline" className={config.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.text}
                      </Badge>
                      {status.error > 0 && (
                        <p className="text-xs text-red-600 mt-1">{status.error} errors</p>
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