"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Network,
  Server,
  Router,
  Shield,
  Wifi,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Plus,
} from "lucide-react"

interface DiscoveredDevice {
  id: string
  ip: string
  hostname: string
  mac: string
  vendor: string
  deviceType: string
  status: "discovered" | "identified" | "added" | "failed"
  services: string[]
  lastSeen: string
  responseTime: number
}

export default function DiscoveryPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanRange, setScanRange] = useState("192.168.1.0/24")
  const [scanMethod, setScanMethod] = useState("ping")
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])

  const discoveredDevices: DiscoveredDevice[] = [
    {
      id: "1",
      ip: "192.168.1.1",
      hostname: "gateway.local",
      mac: "00:1A:2B:3C:4D:5E",
      vendor: "Cisco Systems",
      deviceType: "Router",
      status: "identified",
      services: ["SSH", "HTTP", "SNMP"],
      lastSeen: "2024-01-27 15:30:00",
      responseTime: 12,
    },
    {
      id: "2",
      ip: "192.168.1.10",
      hostname: "switch-floor1.local",
      mac: "00:2B:3C:4D:5E:6F",
      vendor: "HP Enterprise",
      deviceType: "Switch",
      status: "discovered",
      services: ["SNMP", "HTTP"],
      lastSeen: "2024-01-27 15:29:45",
      responseTime: 8,
    },
    {
      id: "3",
      ip: "192.168.1.100",
      hostname: "server-web01.local",
      mac: "00:3C:4D:5E:6F:7A",
      vendor: "Dell Inc.",
      deviceType: "Server",
      status: "added",
      services: ["SSH", "HTTP", "HTTPS", "MySQL"],
      lastSeen: "2024-01-27 15:30:15",
      responseTime: 3,
    },
    {
      id: "4",
      ip: "192.168.1.50",
      hostname: "firewall.local",
      mac: "00:4D:5E:6F:7A:8B",
      vendor: "Fortinet",
      deviceType: "Firewall",
      status: "identified",
      services: ["SSH", "HTTPS", "SNMP"],
      lastSeen: "2024-01-27 15:28:30",
      responseTime: 15,
    },
    {
      id: "5",
      ip: "192.168.1.25",
      hostname: "ap-lobby.local",
      mac: "00:5E:6F:7A:8B:9C",
      vendor: "Ubiquiti Networks",
      deviceType: "Access Point",
      status: "discovered",
      services: ["SSH", "HTTP"],
      lastSeen: "2024-01-27 15:27:20",
      responseTime: 25,
    },
    {
      id: "6",
      ip: "192.168.1.200",
      hostname: "unknown-device",
      mac: "00:6F:7A:8B:9C:AD",
      vendor: "Unknown",
      deviceType: "Unknown",
      status: "failed",
      services: [],
      lastSeen: "2024-01-27 15:25:10",
      responseTime: 0,
    },
  ]

  const scanMethods = [
    { value: "ping", label: "Ping Sweep", description: "Fast ICMP ping discovery" },
    { value: "arp", label: "ARP Scan", description: "ARP table discovery" },
    { value: "snmp", label: "SNMP Discovery", description: "SNMP-based device identification" },
    { value: "port", label: "Port Scan", description: "TCP port scanning" },
    { value: "comprehensive", label: "Comprehensive", description: "All methods combined" },
  ]

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "router":
        return Router
      case "switch":
        return Network
      case "firewall":
        return Shield
      case "server":
        return Server
      case "access point":
        return Wifi
      default:
        return Network
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "discovered":
        return <Badge className="bg-blue-100 text-blue-800">Discovered</Badge>
      case "identified":
        return <Badge className="bg-green-100 text-green-800">Identified</Badge>
      case "added":
        return <Badge className="bg-purple-100 text-purple-800">Added</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "discovered":
      case "identified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "added":
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleStartScan = () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleStopScan = () => {
    setIsScanning(false)
    setScanProgress(0)
  }

  const handleAddDevice = (deviceId: string) => {
    console.log("Adding device:", deviceId)
  }

  const handleAddSelected = () => {
    console.log("Adding selected devices:", selectedDevices)
  }

  const discoveryStats = {
    totalScanned: 254,
    devicesFound: discoveredDevices.length,
    identified: discoveredDevices.filter((d) => d.status === "identified" || d.status === "added").length,
    failed: discoveredDevices.filter((d) => d.status === "failed").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Network Discovery
          </h1>
          <p className="text-muted-foreground">Automatically discover and identify network devices</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Discovery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Scanned</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discoveryStats.totalScanned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devices Found</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discoveryStats.devicesFound}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Identified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discoveryStats.identified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discoveryStats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scan">Network Scan</TabsTrigger>
          <TabsTrigger value="results">Discovery Results</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Discovery Configuration</CardTitle>
              <CardDescription>Configure and start network discovery scan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scan-range">IP Range</Label>
                    <Input
                      id="scan-range"
                      value={scanRange}
                      onChange={(e) => setScanRange(e.target.value)}
                      placeholder="192.168.1.0/24"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scan-method">Discovery Method</Label>
                    <Select value={scanMethod} onValueChange={setScanMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {scanMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-sm text-muted-foreground">{method.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Scan Progress</h4>
                    {isScanning ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Scanning network...</span>
                          <span>{scanProgress}%</span>
                        </div>
                        <Progress value={scanProgress} className="h-2" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Ready to start discovery scan</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={handleStartScan} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Start Scan
                      </Button>
                    ) : (
                      <Button onClick={handleStopScan} variant="destructive" className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Scan
                      </Button>
                    )}
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Discovery Results</CardTitle>
                  <CardDescription>Devices found during network discovery</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleAddSelected} disabled={selectedDevices.length === 0} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Selected ({selectedDevices.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDevices(discoveredDevices.map((d) => d.id))
                          } else {
                            setSelectedDevices([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discoveredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(device.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDevices([...selectedDevices, device.id])
                            } else {
                              setSelectedDevices(selectedDevices.filter((id) => id !== device.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(device.status)}
                          {(() => {
                            const Icon = getDeviceIcon(device.deviceType)
                            return <Icon className="h-4 w-4" />
                          })()}
                          <div>
                            <div className="font-medium">{device.hostname}</div>
                            <div className="text-sm text-muted-foreground">{device.deviceType}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{device.ip}</TableCell>
                      <TableCell className="font-mono text-sm">{device.mac}</TableCell>
                      <TableCell>{device.vendor}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {device.services.map((service) => (
                            <Badge key={service} variant="outline" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell>{device.responseTime > 0 ? `${device.responseTime}ms` : "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {device.status !== "added" && device.status !== "failed" && (
                            <Button variant="ghost" size="sm" onClick={() => handleAddDevice(device.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>Previous network discovery scans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    timestamp: "2024-01-27 15:30:00",
                    range: "192.168.1.0/24",
                    method: "Comprehensive",
                    devicesFound: 6,
                    duration: "2m 34s",
                    status: "completed",
                  },
                  {
                    id: 2,
                    timestamp: "2024-01-27 10:15:00",
                    range: "192.168.1.0/24",
                    method: "Ping Sweep",
                    devicesFound: 5,
                    duration: "45s",
                    status: "completed",
                  },
                  {
                    id: 3,
                    timestamp: "2024-01-26 16:20:00",
                    range: "10.0.0.0/16",
                    method: "SNMP Discovery",
                    devicesFound: 12,
                    duration: "5m 12s",
                    status: "completed",
                  },
                ].map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{scan.timestamp}</p>
                        <p className="text-sm text-muted-foreground">
                          {scan.range} • {scan.method}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{scan.devicesFound}</p>
                        <p className="text-muted-foreground">Devices</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{scan.duration}</p>
                        <p className="text-muted-foreground">Duration</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">{scan.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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
