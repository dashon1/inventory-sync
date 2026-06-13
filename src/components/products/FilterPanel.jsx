import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function FilterPanel({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex items-center gap-4">
      <Filter className="w-4 h-4 text-slate-500" />
      
      <Select
        value={filters.category}
        onValueChange={(value) => handleFilterChange('category', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="electronics">Electronics</SelectItem>
          <SelectItem value="clothing">Clothing</SelectItem>
          <SelectItem value="home">Home</SelectItem>
          <SelectItem value="books">Books</SelectItem>
          <SelectItem value="toys">Toys</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="sports">Sports</SelectItem>
          <SelectItem value="automotive">Automotive</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.stockLevel}
        onValueChange={(value) => handleFilterChange('stockLevel', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stock</SelectItem>
          <SelectItem value="low">Low Stock</SelectItem>
          <SelectItem value="out">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.syncStatus}
        onValueChange={(value) => handleFilterChange('syncStatus', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="issues">Sync Issues</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}