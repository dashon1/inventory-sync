import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, CheckCircle, AlertTriangle, FileText, Package } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setIsProcessing(true);
    setProgress(10);
    setError(null);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProgress(30);

      // Extract data from file
      const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            sku: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            current_stock: { type: "number" },
            minimum_stock: { type: "number" },
            cost_price: { type: "number" },
            selling_price: { type: "number" },
            image_url: { type: "string" },
            barcode: { type: "string" }
          }
        }
      });

      setProgress(60);

      if (extractionResult.status === "error") {
        throw new Error(extractionResult.details || "Failed to extract data from file");
      }

      const products = Array.isArray(extractionResult.output) 
        ? extractionResult.output 
        : [extractionResult.output];

      setProgress(80);

      // Bulk create products
      const createdProducts = await base44.entities.Product.bulkCreate(products);
      
      setProgress(100);
      setResults({
        success: true,
        total: products.length,
        created: createdProducts.length
      });

    } catch (err) {
      console.error("Import error:", err);
      setError(err.message || "Failed to import products");
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setFile(null);
    }
  };

  const downloadTemplate = () => {
    const template = `name,sku,description,category,current_stock,minimum_stock,cost_price,selling_price,image_url,barcode
Wireless Mouse,WM-001,Ergonomic wireless mouse,electronics,50,10,15.00,29.99,https://example.com/image.jpg,123456789012
Gaming Keyboard,GK-001,RGB mechanical keyboard,electronics,30,5,45.00,89.99,,234567890123`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bulk Import Products</h1>
          <p className="text-slate-600 mt-1">Import multiple products at once using CSV or Excel files</p>
        </div>

        {/* Template Download */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Step 1: Download Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Download our CSV template to ensure your data is formatted correctly
            </p>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Step 2: Upload Your File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">
                  {file ? file.name : 'Click to select a file or drag and drop'}
                </p>
                <p className="text-sm text-slate-500">
                  Supports CSV, Excel (.xlsx, .xls)
                </p>
              </label>
            </div>

            {file && !results && (
              <Button 
                onClick={handleUpload} 
                disabled={isProcessing} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <FileText className="w-4 h-4 mr-2 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Products
                  </>
                )}
              </Button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-slate-600 text-center">{progress}% complete</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {results && results.success && (
          <Card className="bg-green-50 border-green-200 border-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Import Successful!</h3>
                  <p className="text-green-700">
                    Successfully imported {results.created} of {results.total} products
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200 border">
          <CardHeader>
            <CardTitle className="text-blue-900">Import Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Ensure all required fields (name, sku, current_stock) are filled</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Use valid category values: electronics, clothing, home, books, toys, health, sports, automotive, other</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Stock and price values should be numbers without currency symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Image URLs should be complete and accessible (optional)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}