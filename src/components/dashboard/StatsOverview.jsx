import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    bgLight: "bg-blue-100"
  },
  green: {
    bg: "bg-green-500", 
    text: "text-green-600",
    bgLight: "bg-green-100"
  },
  orange: {
    bg: "bg-orange-500",
    text: "text-orange-600", 
    bgLight: "bg-orange-100"
  },
  red: {
    bg: "bg-red-500",
    text: "text-red-600",
    bgLight: "bg-red-100"
  }
};

export default function StatsOverview({ title, value, icon: Icon, color, trend, onClick }) {
  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <Card 
      className={`relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${colorClass.bg} rounded-full opacity-10`} />
      <CardHeader className="p-6 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl ${colorClass.bgLight}`}>
            <Icon className={`w-6 h-6 ${colorClass.text}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex items-center text-sm text-slate-500">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>{trend}</span>
        </div>
      </CardContent>
    </Card>
  );
}