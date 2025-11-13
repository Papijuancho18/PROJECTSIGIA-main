"use client"

import { useState } from "react"
import { useElementRegistryContext } from "@/contexts/element-registry-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ElementRegistryDebugger() {
  const { registry, getStats, exportRegistry, importRegistry } = useElementRegistryContext()
  const [exportedData, setExportedData] = useState<string>("")
  const [importData, setImportData] = useState<string>("")
  const stats = getStats()

  const handleExport = () => {
    const data = exportRegistry()
    setExportedData(data)
  }

  const handleImport = () => {
    if (!importData) return
    try {
      importRegistry(importData)
      setImportData("")
      alert("Registry imported successfully")
    } catch (error) {
      alert("Failed to import registry: " + error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Element Registry Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Tables</div>
            <div className="text-2xl font-bold">{stats.tables}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Charts</div>
            <div className="text-2xl font-bold">{stats.charts}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-sm font-medium">Cache Entries</div>
            <div className="text-2xl font-bold">{stats.cacheSize}</div>
          </div>
        </div>

        <Tabs defaultValue="tables">
          <TabsList className="mb-4">
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="export">Export/Import</TabsTrigger>
          </TabsList>

          <TabsContent value="tables">
            <div className="max-h-96 overflow-auto rounded border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Columns</th>
                    <th className="p-2 text-left">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(registry.tables).map(([id, table]) => (
                    <tr key={id} className="border-b">
                      <td className="p-2 font-mono text-xs">{id}</td>
                      <td className="p-2">{table.title || "Untitled"}</td>
                      <td className="p-2">{table.columns.length}</td>
                      <td className="p-2">{table.rows.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <div className="max-h-96 overflow-auto rounded border">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Datasets</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(registry.charts).map(([id, chart]) => (
                    <tr key={id} className="border-b">
                      <td className="p-2 font-mono text-xs">{id}</td>
                      <td className="p-2">{chart.title || "Untitled"}</td>
                      <td className="p-2">{chart.type}</td>
                      <td className="p-2">{chart.data.datasets.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <div className="space-y-4">
              <div>
                <Button onClick={handleExport} className="mb-2">
                  Export Registry
                </Button>
                <textarea className="w-full h-32 p-2 border rounded font-mono text-xs" value={exportedData} readOnly />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium">Import Registry</label>
                  <Button onClick={handleImport} variant="outline" size="sm">
                    Import
                  </Button>
                </div>
                <textarea
                  className="w-full h-32 p-2 border rounded font-mono text-xs"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste exported registry data here..."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
