"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Circle, Play, Settings, Database, Activity, Shield } from "lucide-react"

export default function DeploymentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [deploymentMode, setDeploymentMode] = useState("")
  const [vmMode, setVmMode] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)

  const steps = [
    { id: 0, title: "Environment Setup", description: "Configure basic environment settings" },
    { id: 1, title: "Database Configuration", description: "Setup VictoriaMetrics configuration" },
    { id: 2, title: "Monitoring Components", description: "Configure monitoring services" },
    { id: 3, title: "Alert Configuration", description: "Setup AlertManager and rules" },
    { id: 4, title: "Deployment", description: "Deploy all components" },
  ]

  const components = [
    { name: "VictoriaMetrics", description: "Time series database", required: true, enabled: true },
    { name: "Grafana", description: "Visualization and dashboards", required: true, enabled: true },
    { name: "AlertManager", description: "Alert handling and routing", required: true, enabled: true },
    { name: "Node Exporter", description: "System metrics collection", required: true, enabled: true },
    { name: "SNMP Exporter", description: "SNMP metrics collection", required: false, enabled: true },
    { name: "Categraf", description: "Unified metrics collection", required: false, enabled: true },
    { name: "Nacos", description: "Service discovery", required: false, enabled: false },
  ]

  const handleDeploy = () => {
    setIsDeploying(true)
    setDeploymentProgress(0)

    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeploymentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDeploying(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const StepIndicator = ({ step, isActive, isCompleted }: { step: any; isActive: boolean; isCompleted: boolean }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isActive ? "border-primary bg-primary/5" : isCompleted ? "border-green-500 bg-green-50" : "border-muted"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted ? "bg-green-500 text-white" : isActive ? "bg-primary text-white" : "bg-muted"
        }`}
      >
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      </div>
      <div>
        <h4 className="font-medium">{step.title}</h4>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deployment Wizard</h1>
        <p className="text-muted-foreground">Configure and deploy your network monitoring infrastructure</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Steps Sidebar */}
        <div className="space-y-2">
          {steps.map((step) => (
            <StepIndicator
              key={step.id}
              step={step}
              isActive={currentStep === step.id}
              isCompleted={currentStep > step.id}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Setup
                </CardTitle>
                <CardDescription>Configure basic environment settings for your monitoring platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deployment-mode">Deployment Mode</Label>
                    <Select value={deploymentMode} onValueChange={setDeploymentMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deployment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Node</SelectItem>
                        <SelectItem value="cluster">Cluster Mode</SelectItem>
                        <SelectItem value="docker">Docker Compose</SelectItem>
                        <SelectItem value="kubernetes">Kubernetes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-user">Admin Username</Label>
                      <Input id="admin-user" placeholder="admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-pass">Admin Password</Label>
                      <Input id="admin-pass" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain/IP</Label>
                      <Input id="domain" placeholder="monitoring.example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="UTC">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">London</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  VictoriaMetrics Configuration
                </CardTitle>
                <CardDescription>Configure your time series database settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vm-mode">VictoriaMetrics Mode</Label>
                    <Select value={vmMode} onValueChange={setVmMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select VictoriaMetrics mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Node</SelectItem>
                        <SelectItem value="cluster">Cluster Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {vmMode === "cluster" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium">Cluster Configuration</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vmselect-replicas">VMSelect Replicas</Label>
                          <Input id="vmselect-replicas" type="number" defaultValue="2" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vminsert-replicas">VMInsert Replicas</Label>
                          <Input id="vminsert-replicas" type="number" defaultValue="2" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vmstorage-replicas">VMStorage Replicas</Label>
                          <Input id="vmstorage-replicas" type="number" defaultValue="3" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="retention">Data Retention</Label>
                      <Select defaultValue="30d">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">7 days</SelectItem>
                          <SelectItem value="30d">30 days</SelectItem>
                          <SelectItem value="90d">90 days</SelectItem>
                          <SelectItem value="1y">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storage-size">Storage Size</Label>
                      <Input id="storage-size" placeholder="100GB" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Monitoring Components
                </CardTitle>
                <CardDescription>Select and configure monitoring components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={component.enabled} disabled={component.required} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{component.name}</span>
                            {component.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{component.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>Configure AlertManager and default alert rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-server">SMTP Server (Optional)</Label>
                    <Input id="smtp-server" placeholder="smtp.gmail.com:587" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input id="smtp-user" placeholder="alerts@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">SMTP Password</Label>
                      <Input id="smtp-pass" type="password" placeholder="••••••••" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alert-emails">Alert Recipients</Label>
                    <Input id="alert-emails" placeholder="admin@company.com, ops@company.com" />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">Default Alert Rules</h4>
                    <div className="space-y-2">
                      {[
                        "High CPU Usage (>90%)",
                        "High Memory Usage (>95%)",
                        "Disk Space Low (<10%)",
                        "Interface Down",
                        "Device Unreachable",
                      ].map((rule, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox defaultChecked />
                          <span className="text-sm">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Ready to Deploy
                </CardTitle>
                <CardDescription>Review your configuration and start the deployment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isDeploying && deploymentProgress === 0 && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Deployment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Mode:</strong> {deploymentMode || "Not selected"}
                        </p>
                        <p>
                          <strong>VictoriaMetrics:</strong> {vmMode || "Single node"}
                        </p>
                        <p>
                          <strong>Components:</strong> {components.filter((c) => c.enabled).length} enabled
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Estimated deployment time: 5-10 minutes</span>
                    </div>
                  </div>
                )}

                {(isDeploying || deploymentProgress > 0) && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Deployment Progress</span>
                        <span>{deploymentProgress}%</span>
                      </div>
                      <Progress value={deploymentProgress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Deployment Steps</h4>
                      <div className="space-y-1 text-sm">
                        <div className={`flex items-center gap-2 ${deploymentProgress >= 20 ? "text-green-600" : ""}`}>
                          {deploymentProgress >= 20 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          Installing VictoriaMetrics
                        </div>
                        <div className={`flex items-center gap-2 ${deploymentProgress >= 40 ? "text-green-600" : ""}`}>
                          {deploymentProgress >= 40 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          Setting up Grafana
                        </div>
                        <div className={`flex items-center gap-2 ${deploymentProgress >= 60 ? "text-green-600" : ""}`}>
                          {deploymentProgress >= 60 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          Configuring AlertManager
                        </div>
                        <div className={`flex items-center gap-2 ${deploymentProgress >= 80 ? "text-green-600" : ""}`}>
                          {deploymentProgress >= 80 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          Installing exporters
                        </div>
                        <div className={`flex items-center gap-2 ${deploymentProgress >= 100 ? "text-green-600" : ""}`}>
                          {deploymentProgress >= 100 ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          Finalizing configuration
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {deploymentProgress === 100 && (
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Deployment Completed Successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your monitoring platform is now ready. You can access the services using the configured domain.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>Next</Button>
            ) : (
              <Button onClick={handleDeploy} disabled={isDeploying || deploymentProgress === 100}>
                {isDeploying ? "Deploying..." : deploymentProgress === 100 ? "Completed" : "Start Deployment"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
