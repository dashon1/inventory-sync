import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, Package, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LowStockAlert({ products, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
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

  if (products.length === 0) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" />
            Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">All stock levels are healthy!</p>
            <p className="text-sm text-slate-500 mt-1">
              No products are currently below minimum stock levels.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alert ({products.length})
          </div>
          <Link to={createPageUrl("Products?filter=low-stock")}>
            <Button variant="outline" size="sm">
              View All <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <Link key={product.id} to={createPageUrl("Products")} className="block">
              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all cursor-pointer hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      {product.current_stock} left
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      Min: {product.minimum_stock || 5}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </Link>
          ))}
          
          {products.length > 5 && (
            <Link to={createPageUrl("Products?filter=low-stock")}>
              <Button variant="outline" className="w-full mt-3">
                View {products.length - 5} more low stock items
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}