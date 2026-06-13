import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Star, Phone, Mail, MapPin } from "lucide-react";

import SupplierCard from "../components/suppliers/SupplierCard";
import SupplierForm from "../components/suppliers/SupplierForm";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchQuery]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Supplier.list('-updated_date');
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
    setIsLoading(false);
  };

  const filterSuppliers = () => {
    let filtered = [...suppliers];
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredSuppliers(filtered);
  };

  const handleSaveSupplier = async (supplierData) => {
    try {
      if (editingSupplier) {
        await base44.entities.Supplier.update(editingSupplier.id, supplierData);
      } else {
        await base44.entities.Supplier.create(supplierData);
      }
      setShowForm(false);
      setEditingSupplier(null);
      loadSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await base44.entities.Supplier.delete(id);
        loadSuppliers();
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Supplier Management</h1>
            <p className="text-slate-600 mt-1">Manage your supplier relationships and contacts</p>
          </div>
          <Button onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onEdit={() => { setEditingSupplier(supplier); setShowForm(true); }}
              onDelete={() => handleDeleteSupplier(supplier.id)}
            />
          ))}
        </div>

        {filteredSuppliers.length === 0 && !isLoading && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <p className="text-slate-600">No suppliers found. Add your first supplier to get started.</p>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <SupplierForm
            supplier={editingSupplier}
            onSave={handleSaveSupplier}
            onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
          />
        )}
      </div>
    </div>
  );
}