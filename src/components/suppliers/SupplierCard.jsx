import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Mail, MapPin, Edit, Trash2, Clock } from "lucide-react";

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  blacklisted: "bg-red-100 text-red-800"
};

const paymentTermsLabels = {
  net_15: "Net 15",
  net_30: "Net 30",
  net_60: "Net 60",
  cod: "Cash on Delivery",
  advance: "Advance Payment"
};

export default function SupplierCard({ supplier, onEdit, onDelete }) {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg">{supplier.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(supplier.rating)}
            </div>
          </div>
          <Badge className={statusColors[supplier.status || 'active']}>
            {(supplier.status || 'active').charAt(0).toUpperCase() + (supplier.status || 'active').slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {supplier.contact_person && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">{supplier.contact_person.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-slate-700">{supplier.contact_person}</span>
          </div>
        )}

        <div className="space-y-2 text-sm">
          {supplier.email && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{supplier.phone}</span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{supplier.address}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t space-y-2">
          {supplier.lead_time_days && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Lead Time
              </span>
              <span className="font-medium">{supplier.lead_time_days} days</span>
            </div>
          )}
          {supplier.payment_terms && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Payment Terms</span>
              <span className="font-medium">{paymentTermsLabels[supplier.payment_terms]}</span>
            </div>
          )}
          {supplier.minimum_order_value && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Min Order</span>
              <span className="font-medium">${supplier.minimum_order_value}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}