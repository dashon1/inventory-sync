import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, AlertCircle, Bell, BellOff, XCircle } from "lucide-react";
import { format } from "date-fns";

const severityConfig = {
  low: { color: "bg-blue-100 text-blue-800", icon: Bell },
  medium: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
  high: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
  critical: { color: "bg-red-100 text-red-800", icon: XCircle }
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("unresolved");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Alert.list('-created_date');
      setAlerts(data);
    } catch (error) {
      console.error("Error loading alerts:", error);
    }
    setIsLoading(false);
  };

  const handleResolveAlert = async (alert) => {
    try {
      await base44.entities.Alert.update(alert.id, {
        is_resolved: true,
        resolved_date: new Date().toISOString()
      });
      loadAlerts();
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const handleMarkAsRead = async (alert) => {
    try {
      await base44.entities.Alert.update(alert.id, { is_read: true });
      loadAlerts();
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "unresolved") return !alert.is_resolved;
    if (filter === "resolved") return alert.is_resolved;
    if (filter === "critical") return alert.severity === "critical" || alert.severity === "high";
    return true;
  });

  const criticalCount = alerts.filter(a => !a.is_resolved && (a.severity === "critical" || a.severity === "high")).length;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Alerts & Notifications</h1>
            <p className="text-slate-600 mt-1">Monitor critical inventory and sync issues</p>
          </div>
          {criticalCount > 0 && (
            <Badge className="bg-red-500 text-white text-lg px-4 py-2">
              {criticalCount} Critical Alerts
            </Badge>
          )}
        </div>

        <Tabs value={filter} onValueChange={setFilter} className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="unresolved">
              Unresolved ({alerts.filter(a => !a.is_resolved).length})
            </TabsTrigger>
            <TabsTrigger value="critical">
              Critical ({alerts.filter(a => a.severity === "critical" || a.severity === "high").length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({alerts.filter(a => a.is_resolved).length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const config = severityConfig[alert.severity] || severityConfig.medium;
              const Icon = config.icon;

              return (
                <Card key={alert.id} className={`bg-white/60 backdrop-blur-sm border-0 shadow-lg ${!alert.is_read ? 'border-l-4 border-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${config.color.replace('text', 'text').replace('bg', 'bg')}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={config.color}>{alert.severity.toUpperCase()}</Badge>
                            <Badge variant="outline">{alert.alert_type.replace(/_/g, ' ').toUpperCase()}</Badge>
                          </div>
                          <p className="text-slate-900 font-medium">{alert.message}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {format(new Date(alert.created_date), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!alert.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(alert)}>
                            Mark Read
                          </Button>
                        )}
                        {!alert.is_resolved && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleResolveAlert(alert)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                        {alert.is_resolved && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}

            {filteredAlerts.length === 0 && (
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BellOff className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No alerts to display</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {filter === "unresolved" ? "All alerts have been resolved!" : "No alerts match the current filter"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}