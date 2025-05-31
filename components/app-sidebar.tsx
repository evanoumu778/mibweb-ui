"use client"

import type * as React from "react"
import { FileText, Settings, Wrench, HardDrive, Home, Database } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "MIB Platform",
      logo: Database,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "MIB Management",
      url: "#",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "MIB Library",
          url: "/mibs",
        },
        {
          title: "Import/Export",
          url: "/mibs/import-export",
        },
        {
          title: "OID Browser",
          url: "/mibs/oid-browser",
        },
        {
          title: "MIB Validator",
          url: "/mibs/validator",
        },
      ],
    },
    {
      title: "Configuration Generator",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Generate Config",
          url: "/config-gen",
        },
        {
          title: "Templates",
          url: "/config-gen/templates",
        },
        {
          title: "Config Validator",
          url: "/config-gen/validator",
        },
        {
          title: "Version History",
          url: "/config-gen/versions",
        },
      ],
    },
    {
      title: "Device Management",
      url: "#",
      icon: HardDrive,
      items: [
        {
          title: "Devices",
          url: "/devices",
        },
        {
          title: "Device Templates",
          url: "/devices/templates",
        },
        {
          title: "SNMP Testing",
          url: "/devices/testing",
        },
      ],
    },
    {
      title: "Tools",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "OID Converter",
          url: "/tools/oid-converter",
        },
        {
          title: "SNMP Walker",
          url: "/tools/snmp-walker",
        },
        {
          title: "Config Diff",
          url: "/tools/config-diff",
        },
        {
          title: "Bulk Operations",
          url: "/tools/bulk-ops",
        },
      ],
    },
    {
      title: "System Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
