
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle,
  Edit,
  Eye
} from "lucide-react";

import ProductCard from "../components/products/ProductCard";
import ProductForm from "../components/products/ProductForm";
import FilterPanel from "../components/products/FilterPanel";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    stockLevel: "all",
    syncStatus: "all"
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await Product.list('-updated_date');
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
    setIsLoading(false);
  };

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Stock level filter
    if (filters.stockLevel === "low") {
      filtered = filtered.filter(product => product.current_stock <= (product.minimum_stock || 5));
    } else if (filters.stockLevel === "out") {
      filtered = filtered.filter(product => product.current_stock === 0);
    }

    // Sync status filter
    if (filters.syncStatus === "issues") {
      filtered = filtered.filter(product => 
        product.shopify_sync_status === 'error' ||
        product.amazon_sync_status === 'error' ||
        product.ebay_sync_status === 'error'
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filters, filterProducts]);

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
      } else {
        await Product.create(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Product Inventory</h1>
            <p className="text-slate-600 mt-1">
              Manage your products across all sales channels
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search products or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <FilterPanel 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          {searchQuery && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              <Search className="w-3 h-3 mr-1" />
              "{searchQuery}"
            </Badge>
          )}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="w-full h-32 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {products.length === 0 ? "No products yet" : "No products match your filters"}
              </h3>
              <p className="text-slate-600 mb-6">
                {products.length === 0 
                  ? "Start building your inventory by adding your first product"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEditProduct(product)}
              />
            ))}
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
