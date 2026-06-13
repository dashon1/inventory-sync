import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Edit, CheckCircle, XCircle, Clock } from "lucide-react";

const syncStatusConfig = {
  synced: { color: "text-green-600", icon: CheckCircle },
  pending: { color: "text-yellow-600", icon: Clock },
  error: { color: "text-red-600", icon: XCircle },
  not_connected: { color: "text-gray-400", icon: XCircle }
};

export default function ProductCard({ product, onEdit }) {
  const isLowStock = product.current_stock <= (product.minimum_stock || 5);
  const isOutOfStock = product.current_stock === 0;

  const getSyncIcon = (status) => {
    const config = syncStatusConfig[status] || syncStatusConfig.not_connected;
    const Icon = config.icon;
    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{product.name}</h3>
            <p className="text-sm text-slate-500">SKU: {product.sku}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-4">
        {/* Product Image */}
        <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-slate-400" />
          )}
        </div>

        {/* Stock Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Current Stock</span>
            <Badge
              variant="outline"
              className={
                isOutOfStock
                  ? "bg-red-100 text-red-800 border-red-300"
                  : isLowStock
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : "bg-green-100 text-green-800 border-green-300"
              }
            >
              {isOutOfStock && <AlertTriangle className="w-3 h-3 mr-1" />}
              {product.current_stock} units
            </Badge>
          </div>
          
          {isLowStock && !isOutOfStock && (
            <p className="text-xs text-orange-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Below minimum ({product.minimum_stock || 5})
            </p>
          )}
        </div>

        {/* Channel Distribution */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            Channel Stock
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-slate-500">Shopify</p>
              <p className="font-medium">{product.shopify_stock || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500">Amazon</p>
              <p className="font-medium">{product.amazon_stock || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500">eBay</p>
              <p className="font-medium">{product.ebay_stock || 0}</p>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
            Sync Status
          </p>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {getSyncIcon(product.shopify_sync_status)}
              {getSyncIcon(product.amazon_sync_status)}
              {getSyncIcon(product.ebay_sync_status)}
            </div>
            {product.last_sync_date && (
              <p className="text-xs text-slate-500">
                {new Date(product.last_sync_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Price Info */}
        {product.selling_price && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-slate-600">Price</span>
            <span className="font-semibold text-slate-900">
              ${product.selling_price.toFixed(2)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}