"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "zh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    "nav.platform": "Platform",
    "nav.dashboard": "Dashboard",
    "nav.monitoring": "Network Monitoring",
    "nav.devices": "Devices",
    "nav.topology": "Network Topology",
    "nav.discovery": "Network Discovery",
    "nav.services": "Services",
    "nav.alerts": "Alerts & Events",
    "nav.alert-management": "Alert Management",
    "nav.events": "Event Logs",
    "nav.notifications": "Notifications",
    "nav.analytics": "Analytics & Intelligence",
    "nav.ai-analytics": "AI Analytics",
    "nav.intelligent": "Intelligent Analysis",
    "nav.performance": "Performance Analytics",
    "nav.reports": "Reports",
    "nav.assets": "Asset Management",
    "nav.it-assets": "IT Assets",
    "nav.inventory": "Inventory",
    "nav.lifecycle": "Lifecycle",
    "nav.capacity": "Capacity Planning",
    "nav.configuration": "Configuration",
    "nav.config-gen": "Config Generation",
    "nav.mibs": "MIB Management",
    "nav.templates": "Templates",
    "nav.backup": "Backup & Restore",
    "nav.automation": "Automation",
    "nav.workflows": "Workflows",
    "nav.scripts": "Scripts",
    "nav.tasks": "Task Scheduler",
    "nav.security": "Security",
    "nav.security-dashboard": "Security Dashboard",
    "nav.vulnerabilities": "Vulnerability Scan",
    "nav.compliance": "Compliance",
    "nav.access-control": "Access Control",
    "nav.mobile": "Mobile & PWA",
    "nav.mobile-dashboard": "Mobile Dashboard",
    "nav.app-settings": "App Settings",
    "nav.offline": "Offline Mode",
    "nav.management": "Management",
    "nav.users": "User Management",
    "nav.api": "API Management",
    "nav.deployment": "Deployment",
    "nav.settings": "System Settings",
    "common.loading": "Loading...",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.refresh": "Refresh",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.create": "Create",
    "common.update": "Update",
    "common.close": "Close",
    "common.open": "Open",
    "dashboard.title": "Network Monitoring Dashboard",
    "dashboard.overview": "System Overview",
    "dashboard.devices": "Total Devices",
    "dashboard.alerts": "Active Alerts",
    "dashboard.uptime": "Network Uptime",
    "dashboard.traffic": "Network Traffic",
    "header.title": "Network Monitor",
  },
  zh: {
    "nav.platform": "平台",
    "nav.dashboard": "仪表板",
    "nav.monitoring": "网络监控",
    "nav.devices": "设备管理",
    "nav.topology": "网络拓扑",
    "nav.discovery": "网络发现",
    "nav.services": "服务管理",
    "nav.alerts": "告警与事件",
    "nav.alert-management": "告警管理",
    "nav.events": "事件日志",
    "nav.notifications": "通知管理",
    "nav.analytics": "分析与智能",
    "nav.ai-analytics": "AI分析",
    "nav.intelligent": "智能分析",
    "nav.performance": "性能分析",
    "nav.reports": "报告管理",
    "nav.assets": "资产管理",
    "nav.it-assets": "IT资产",
    "nav.inventory": "库存管理",
    "nav.lifecycle": "生命周期",
    "nav.capacity": "容量规划",
    "nav.configuration": "配置管理",
    "nav.config-gen": "配置生成",
    "nav.mibs": "MIB管理",
    "nav.templates": "模板管理",
    "nav.backup": "备份恢复",
    "nav.automation": "自动化",
    "nav.workflows": "工作流",
    "nav.scripts": "脚本管理",
    "nav.tasks": "任务调度",
    "nav.security": "安全管理",
    "nav.security-dashboard": "安全仪表板",
    "nav.vulnerabilities": "漏洞扫描",
    "nav.compliance": "合规管理",
    "nav.access-control": "访问控制",
    "nav.mobile": "移动端与PWA",
    "nav.mobile-dashboard": "移动端仪表板",
    "nav.app-settings": "应用设置",
    "nav.offline": "离线模式",
    "nav.management": "系统管理",
    "nav.users": "用户管理",
    "nav.api": "API管理",
    "nav.deployment": "部署管理",
    "nav.settings": "系统设置",
    "common.loading": "加载中...",
    "common.search": "搜索",
    "common.filter": "筛选",
    "common.export": "导出",
    "common.refresh": "刷新",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.view": "查看",
    "common.create": "创建",
    "common.update": "更新",
    "common.close": "关闭",
    "common.open": "打开",
    "dashboard.title": "网络监控仪表板",
    "dashboard.overview": "系统概览",
    "dashboard.devices": "设备总数",
    "dashboard.alerts": "活跃告警",
    "dashboard.uptime": "网络正常运行时间",
    "dashboard.traffic": "网络流量",
    "header.title": "网络监控平台",
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "zh")) {
      setLanguage(savedLanguage)
    }
    setIsInitialized(true)
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"

    // Force re-render by dispatching a custom event
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lang }))
  }

  const t = (key: string): string => {
    if (!isInitialized) return key
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
