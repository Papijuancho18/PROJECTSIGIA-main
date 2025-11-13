import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InfoIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataExplanationProps {
  title: string
  description?: string
  insights: {
    text: string
    trend?: "up" | "down" | "neutral"
    highlight?: boolean
  }[]
  className?: string
}

export function DataExplanation({ title, description, insights, className }: DataExplanationProps) {
  return (
    <Card className={cn("shadow-sm border-primary/10", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <InfoIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              {insight.trend === "up" && <TrendingUp className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />}
              {insight.trend === "down" && <TrendingDown className="h-5 w-5 text-alert mt-0.5 flex-shrink-0" />}
              {insight.trend === "neutral" && <Minus className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />}
              {!insight.trend && (
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
              )}
              <span className={insight.highlight ? "text-primary font-medium" : ""}>
                {insight.text}
                {insight.highlight && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Destacado
                  </Badge>
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
