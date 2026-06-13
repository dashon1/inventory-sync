import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Upload } from "lucide-react";

const categories = [
  "electronics", "clothing", "home", "books", "toys", 
  "health", "sports", "automotive", "other"
];

export default function ProductForm({ product, onSave, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    category: "other",
    current_stock: 0,
    minimum_stock: 5,
    reorder_point: 10,
    reorder_quantity: 50,
    cost_price: 0,
    selling_price: 0,
    shopify_stock: 0,
    amazon_stock: 0,
    ebay_stock: 0,
    image_url: "",
    weight: 0,
    dimensions: "",
    status: "active"
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('image_url', file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="Enter SKU"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="barcode">Barcode / UPC</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="Product barcode"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                    <Label
                      htmlFor="file-upload"
                      className={`flex items-center justify-center h-10 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-md cursor-pointer border border-slate-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUploading ? (
                        <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Label>
                  </div>
                </div>
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="Product Preview" 
                      className="h-20 w-20 object-cover rounded-md border border-slate-200" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Stock Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Stock Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="current_stock">Current Stock *</Label>
                  <Input
                    id="current_stock"
                    type="number"
                    min="0"
                    value={formData.current_stock}
                    onChange={(e) => handleChange('current_stock', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minimum_stock">Minimum Stock</Label>
                  <Input
                    id="minimum_stock"
                    type="number"
                    min="0"
                    value={formData.minimum_stock}
                    onChange={(e) => handleChange('minimum_stock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="reorder_point">Reorder Point</Label>
                  <Input
                    id="reorder_point"
                    type="number"
                    min="0"
                    value={formData.reorder_point}
                    onChange={(e) => handleChange('reorder_point', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="reorder_quantity">Reorder Qty</Label>
                  <Input
                    id="reorder_quantity"
                    type="number"
                    min="0"
                    value={formData.reorder_quantity}
                    onChange={(e) => handleChange('reorder_quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => handleChange('cost_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => handleChange('selling_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Channel Allocation */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Channel Stock Allocation</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shopify_stock">Shopify Stock</Label>
                  <Input
                    id="shopify_stock"
                    type="number"
                    min="0"
                    value={formData.shopify_stock}
                    onChange={(e) => handleChange('shopify_stock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="amazon_stock">Amazon Stock</Label>
                  <Input
                    id="amazon_stock"
                    type="number"
                    min="0"
                    value={formData.amazon_stock}
                    onChange={(e) => handleChange('amazon_stock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="ebay_stock">eBay Stock</Label>
                  <Input
                    id="ebay_stock"
                    type="number"
                    min="0"
                    value={formData.ebay_stock}
                    onChange={(e) => handleChange('ebay_stock', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {product ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}