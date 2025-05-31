"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronRight, ChevronDown, Copy, Info } from "lucide-react"

interface OIDNode {
  id: string
  name: string
  oid: string
  description: string
  type: string
  access: string
  children?: OIDNode[]
  expanded?: boolean
}

export default function OIDBrowserPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOid, setSelectedOid] = useState<OIDNode | null>(null)

  const oidTree: OIDNode[] = [
    {
      id: "1",
      name: "iso",
      oid: "1",
      description: "ISO assigned OIDs",
      type: "node",
      access: "not-accessible",
      children: [
        {
          id: "1.3",
          name: "org",
          oid: "1.3",
          description: "ISO identified organization",
          type: "node",
          access: "not-accessible",
          children: [
            {
              id: "1.3.6",
              name: "dod",
              oid: "1.3.6",
              description: "US Department of Defense",
              type: "node",
              access: "not-accessible",
              children: [
                {
                  id: "1.3.6.1",
                  name: "internet",
                  oid: "1.3.6.1",
                  description: "Internet",
                  type: "node",
                  access: "not-accessible",
                  children: [
                    {
                      id: "1.3.6.1.2",
                      name: "mgmt",
                      oid: "1.3.6.1.2",
                      description: "Management",
                      type: "node",
                      access: "not-accessible",
                      children: [
                        {
                          id: "1.3.6.1.2.1",
                          name: "mib-2",
                          oid: "1.3.6.1.2.1",
                          description: "Management Information Base",
                          type: "node",
                          access: "not-accessible",
                          children: [
                            {
                              id: "1.3.6.1.2.1.1",
                              name: "system",
                              oid: "1.3.6.1.2.1.1",
                              description: "System group",
                              type: "node",
                              access: "not-accessible",
                              children: [
                                {
                                  id: "1.3.6.1.2.1.1.1.0",
                                  name: "sysDescr",
                                  oid: "1.3.6.1.2.1.1.1.0",
                                  description: "A textual description of the entity",
                                  type: "DisplayString",
                                  access: "read-only",
                                },
                                {
                                  id: "1.3.6.1.2.1.1.3.0",
                                  name: "sysUpTime",
                                  oid: "1.3.6.1.2.1.1.3.0",
                                  description: "Time since the network management portion was last re-initialized",
                                  type: "TimeTicks",
                                  access: "read-only",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["1", "1.3", "1.3.6", "1.3.6.1"]))

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderOIDNode = (node: OIDNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const isLeaf = !hasChildren

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer ${
            selectedOid?.id === node.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id)
            }
            setSelectedOid(node)
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}

          <div className="flex-1 flex items-center gap-2">
            <span className="font-medium">{node.name}</span>
            <code className="text-xs bg-muted px-1 rounded">{node.oid}</code>
            {isLeaf && (
              <Badge variant="outline" className="text-xs">
                {node.type}
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && <div>{node.children!.map((child) => renderOIDNode(child, level + 1))}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">OID Browser</h1>
        <p className="text-muted-foreground">Browse and explore SNMP OID tree structure</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* OID Tree */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>OID Tree</CardTitle>
              <CardDescription>Navigate through the SNMP OID hierarchy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search OIDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="border rounded-lg max-h-[600px] overflow-auto">
                  <div className="p-2">{oidTree.map((node) => renderOIDNode(node))}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OID Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                OID Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOid ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{selectedOid.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm">{selectedOid.oid}</code>
                      <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(selectedOid.oid)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <p className="text-sm mt-1">{selectedOid.description}</p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedOid.type}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Access:</span>
                      <Badge variant="secondary" className="ml-2">
                        {selectedOid.access}
                      </Badge>
                    </div>

                    {selectedOid.children && selectedOid.children.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Children:</span>
                        <p className="text-sm mt-1">{selectedOid.children.length} child nodes</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Add to Configuration
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select an OID to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
