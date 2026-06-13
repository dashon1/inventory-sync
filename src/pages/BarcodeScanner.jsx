import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scan, Package, Plus, Minus, CheckCircle, AlertTriangle } from "lucide-react";

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState("sale"); // sale, restock, adjustment
  const [message, setMessage] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    // Auto-focus on barcode input
    document.getElementById('barcode-input')?.focus();
  }, []);

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setMessage(null);
    setProduct(null);

    try {
      // Search for product by barcode
      const products = await base44.entities.Product.filter({ barcode: barcode.trim() });
      
      if (products.length === 0) {
        setMessage({ type: "error", text: `No product found with barcode: ${barcode}` });
        setBarcode("");
        return;
      }

      setProduct(products[0]);
    } catch (error) {
      console.error("Error finding product:", error);
      setMessage({ type: "error", text: "Error searching for product" });
    }
  };

  const handleOperation = async () => {
    if (!product) return;

    try {
      let newStock = product.current_stock;
      let quantityChange = quantity;

      if (operation === "sale") {
        newStock = product.current_stock - quantity;
        quantityChange = -quantity;
        if (newStock < 0) {
          setMessage({ type: "error", text: "Insufficient stock for this sale" });
          return;
        }
      } else if (operation === "restock") {
        newStock = product.current_stock + quantity;
      } else if (operation === "adjustment") {
        newStock = quantity; // Set to exact quantity
        quantityChange = quantity - product.current_stock;
      }

      // Update product stock
      await base44.entities.Product.update(product.id, {
        current_stock: newStock,
        total_sold: operation === "sale" ? (product.total_sold || 0) + quantity : product.total_sold
      });

      // Create transaction record
      await base44.entities.InventoryTransaction.create({
        product_id: product.id,
        transaction_type: operation === "sale" ? "sale" : operation === "restock" ? "restock" : "adjustment",
        channel: "manual",
        quantity_change: quantityChange,
        reason: `Barcode scanner - ${operation}`,
        unit_price: operation === "sale" ? product.selling_price : product.cost_price
      });

      // Add to recent scans
      setRecentScans(prev => [{
        product: product.name,
        operation,
        quantity,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]);

      setMessage({ 
        type: "success", 
        text: `Successfully processed ${operation} for ${product.name}. New stock: ${newStock}` 
      });
      
      // Reset form
      setBarcode("");
      setProduct(null);
      setQuantity(1);
      
      // Refocus input
      setTimeout(() => {
        document.getElementById('barcode-input')?.focus();
      }, 100);

    } catch (error) {
      console.error("Error processing operation:", error);
      setMessage({ type: "error", text: "Error processing operation" });
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Barcode Scanner</h1>
          <p className="text-slate-600 mt-1">Quickly update inventory by scanning product barcodes</p>
        </div>

        {/* Scanner Input */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scan Barcode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBarcodeSubmit} className="space-y-4">
              <div>
                <Input
                  id="barcode-input"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter or scan barcode..."
                  className="text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Scan className="w-4 h-4 mr-2" />
                Search Product
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages */}
        {message && (
          <Alert className={message.type === "error" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
            {message.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Product Details */}
        {product && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Product Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-slate-200 rounded flex items-center justify-center">
                    <Package className="w-10 h-10 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-slate-600">SKU: {product.sku}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={
                      product.current_stock === 0 ? "bg-red-100 text-red-800" :
                      product.current_stock <= (product.minimum_stock || 5) ? "bg-orange-100 text-orange-800" :
                      "bg-green-100 text-green-800"
                    }>
                      Current Stock: {product.current_stock}
                    </Badge>
                    <Badge variant="outline">Price: ${product.selling_price?.toFixed(2) || '0.00'}</Badge>
                  </div>
                </div>
              </div>

              {/* Operation Type */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Operation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={operation === "sale" ? "default" : "outline"}
                    onClick={() => setOperation("sale")}
                    className={operation === "sale" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <Minus className="w-4 h-4 mr-1" />
                    Sale
                  </Button>
                  <Button
                    type="button"
                    variant={operation === "restock" ? "default" : "outline"}
                    onClick={() => setOperation("restock")}
                    className={operation === "restock" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Restock
                  </Button>
                  <Button
                    type="button"
                    variant={operation === "adjustment" ? "default" : "outline"}
                    onClick={() => setOperation("adjustment")}
                    className={operation === "adjustment" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    Adjust
                  </Button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {operation === "adjustment" ? "Set Stock To" : "Quantity"}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="text-lg"
                />
              </div>

              {/* Submit */}
              <Button onClick={handleOperation} className="w-full bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm {operation.charAt(0).toUpperCase() + operation.slice(1)}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{scan.product}</p>
                      <p className="text-sm text-slate-600">
                        {scan.operation} - Qty: {scan.quantity}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {scan.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}