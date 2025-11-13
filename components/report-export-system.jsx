"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, Download } from "lucide-react";

export default function ReportExportSystem({ reportData, templates = [], onExportComplete }) {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || "institutional");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setProgress(10);
      setStatusMessage("Generando gráfico y preparando datos...");
      setError(null);
      setExportComplete(false);

      if (!reportData || !reportData.title) throw new Error("Datos del reporte incompletos");
      if (!reportData.sections || reportData.sections.length === 0)
        throw new Error("El reporte no contiene secciones para exportar");

      const response = await fetch(`/api/export-report/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: reportData,
          format: selectedFormat,
          template: selectedTemplate,
        }),
      });

      setProgress(70);
      setStatusMessage("Procesando respuesta del servidor...");

      if (!response.ok) {
        throw new Error(`Error al generar reporte (${response.status})`);
      }

      const blob = await response.blob();
      const filename = `reporte_${Date.now()}.${selectedFormat === "word" ? "docx" : selectedFormat}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setStatusMessage(`Exportación completada: ${filename}`);
      setExportComplete(true);
      if (onExportComplete) onExportComplete(selectedFormat);
    } catch (err) {
      console.error("Error en la exportación:", err);
      setError(`Error: ${err.message || "Error desconocido"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Exportar Reporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="format-select" className="text-sm font-medium">
                Formato de Exportación
              </label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat} disabled={isExporting}>
                <SelectTrigger id="format-select" className="w-full">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="template-select" className="text-sm font-medium">
                Plantilla de Documento
              </label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                disabled={isExporting || templates.length === 0}
              >
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="institutional">Formato Institucional</SelectItem>
                  {templates.map((template, index) => (
                    <SelectItem key={index} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{statusMessage}</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {exportComplete && !error && (
            <Alert>
              <AlertDescription className="text-green-600">{statusMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleExport} disabled={isExporting} className="gap-2">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

