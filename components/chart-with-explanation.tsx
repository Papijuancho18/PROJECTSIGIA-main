"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EnhancedChartPreview } from "@/components/enhanced-chart-preview"
import type { ChartData } from "./chart-data-editor"

interface ChartWithExplanationProps {
  title: string
  description?: string
  chartData: ChartData
  explanation: string
}

export function ChartWithExplanation({ title, description, chartData, explanation }: ChartWithExplanationProps) {
  const [activeTab, setActiveTab] = useState<string>("chart")

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
            <TabsTrigger value="explanation">Explicación</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <EnhancedChartPreview chartData={chartData} height="300px" />
          </TabsContent>
          <TabsContent value="explanation">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: explanation }} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
