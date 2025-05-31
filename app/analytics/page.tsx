"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Users,
  Clock,
  Database,
  Wifi,
} from "lucide-react"

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedMetric, setSelectedMetric] = useState("all")

  // Mock analytics data
  const overviewMetrics = {
    totalDevices: 156,
    deviceChange: 8.2,
    activeAlerts: 23,
    alertChange: -12.5,
    avgResponseTime: 2.3,
    responseChange: -5.8,
    networkUptime: 99.7,
    uptimeChange: 0.2,
  }

  const performanceData = [
    { metric: "CPU Usage", current: 68, trend: "up", change: 5.2, threshold: 80, status: "normal" },
    { metric: "Memory Usage", current: 72, trend: "up", change: 3.1, threshold: 85, status: "normal" },
    { metric: "Disk Usage", current: 45, trend: "down", change: -2.8, threshold: 90, status: "normal" },
    { metric: "Network Utilization", current: 34, trend: "up", change: 8.7, threshold: 70, status: "normal" },
    { metric: "Interface Errors", current: 0.02, trend: "down", change: -15.3, threshold: 1, status: "good" },
    { metric: "Packet Loss", current: 0.1, trend: "stable", change: 0.0, threshold: 0.5, status: "good" },
  ]

  const capacityForecast = [
    { resource: "CPU", current: 68, forecast30d: 72, forecast90d: 78, capacity: 100, risk: "low" },
    { resource: "Memory", current: 72, forecast30d: 76, forecast90d: 82, capacity: 100, risk: "medium" },
    { resource: "Storage", current: 45, forecast30d: 52, forecast90d: 65, capacity: 100, risk: "low" },
    { resource: "Bandwidth", current: 34, forecast30d: 38, forecast90d: 45, capacity: 100, risk: "low" },
  ]

  const alertAnalytics = [
    { type: "Critical", count: 5, avgResolution: "15m", trend: "down", change: -20 },
    { type: "Warning", count: 18, avgResolution: "45m", trend: "up", change: 12 },
    { type: "Info", count: 42, avgResolution: "2h", trend: "stable", change: 0 },
  ]

  const userActivity = [
    { user: "admin", logins: 45, actions: 234, lastActive: "2024-01-20 15:30" },
    { user: "netadmin", logins: 32, actions: 156, lastActive: "2024-01-20 14:45" },
    { user: "operator1", logins: 28, actions: 89, lastActive: "2024-01-20 13:20" },
    { user: "viewer", logins: 12, actions: 23, lastActive: "2024-01-19 16:00" },
  ]

  const insights = [
    {
      id: 1,
      type: "performance",
      severity: "medium",
      title: "Memory Usage Trending Up",
      description: "Memory usage has increased by 15% over the past week across core switches",
      recommendation: "Consider upgrading memory on core switches or optimizing configurations",
      impact: "Medium",
      confidence: 85,
    },
    {
      id: 2,
      type: "capacity",
      severity: "high",
      title: "Storage Capacity Warning",
      description: "Database server storage will reach 90% capacity within 60 days at current growth rate",
      recommendation: "Plan storage expansion or implement data archiving strategy",
      impact: "High",
      confidence: 92,
    },
    {
      id: 3,
      type: "optimization",
      severity: "low",
      title: "Underutilized Resources",
      description: "Several access switches are running at less than 20% capacity",
      recommendation: "Consider consolidating workloads or redistributing traffic",
      impact: "Low",
      confidence: 78,
    },
    {
      id: 4,
      type: "security",
      severity: "medium",
      title: "Unusual Login Pattern",
      description: "Increased after-hours login activity detected from external IP ranges",
      recommendation: "Review access logs and consider implementing additional authentication",
      impact: "Medium",
      confidence: 88,
    },
  ]

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up" || change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend === "down" || change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-100 text-green-800">Good</Badge>
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      case "high":
        return <Badge variant="destructive">High Risk</Badge>
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <BarChart3 className="h-4 w-4 text-blue-500" />
      case "capacity":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case "optimization":
        return <Target className="h-4 w-4 text-green-500" />
      case "security":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Lightbulb className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Advanced analytics and intelligent insights for network optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="capacity">Capacity</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.totalDevices}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon("up", overviewMetrics.deviceChange)}
              <span className="ml-1">+{overviewMetrics.deviceChange}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.activeAlerts}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon("down", overviewMetrics.alertChange)}
              <span className="ml-1">{overviewMetrics.alertChange}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.avgResponseTime}s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon("down", overviewMetrics.responseChange)}
              <span className="ml-1">{overviewMetrics.responseChange}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.networkUptime}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon("up", overviewMetrics.uptimeChange)}
              <span className="ml-1">+{overviewMetrics.uptimeChange}% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="alerts">Alert Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time performance indicators across your network infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{item.metric}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getTrendIcon(item.trend, item.change)}
                          <span>
                            {Math.abs(item.change)}% {item.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{item.current}%</p>
                        <p className="text-sm text-muted-foreground">Threshold: {item.threshold}%</p>
                      </div>
                      <div className="w-24">
                        <Progress value={item.current} className="h-2" />
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Forecast</CardTitle>
              <CardDescription>Predictive analysis for resource capacity planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {capacityForecast.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.resource}</p>
                      <p className="text-sm text-muted-foreground">Current: {item.current}%</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">{item.forecast30d}%</p>
                        <p className="text-xs text-muted-foreground">30 days</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{item.forecast90d}%</p>
                        <p className="text-xs text-muted-foreground">90 days</p>
                      </div>
                      {getRiskBadge(item.risk)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Analytics</CardTitle>
              <CardDescription>Analysis of alert patterns and resolution times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertAnalytics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.type} Alerts</p>
                      <p className="text-sm text-muted-foreground">Avg Resolution: {item.avgResolution}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{item.count}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {getTrendIcon(item.trend, item.change)}
                          <span className="ml-1">
                            {Math.abs(item.change)}% {item.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Intelligent recommendations based on network analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        {getSeverityIcon(insight.severity)}
                        <h3 className="font-medium">{insight.title}</h3>
                      </div>
                      <Badge variant="outline">{insight.confidence}% confidence</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <p className="text-sm font-medium mb-2">Recommendation:</p>
                    <p className="text-sm">{insight.recommendation}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline">Impact: {insight.impact}</Badge>
                      <Button size="sm" variant="outline">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Apply Suggestion
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>System usage patterns and user behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.user}</p>
                        <p className="text-sm text-muted-foreground">Last active: {user.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-lg font-bold">{user.logins}</p>
                        <p className="text-xs text-muted-foreground">Logins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{user.actions}</p>
                        <p className="text-xs text-muted-foreground">Actions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
