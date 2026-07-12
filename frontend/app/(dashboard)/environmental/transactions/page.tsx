"use client"

import { Leaf, Bell, Search, Plus, ChevronRight, Download, ArrowUp, ArrowDown, TreePine, Wind, Droplet, SlidersHorizontal, Columns, MoreHorizontal } from "lucide-react"
import { SubTabs } from "@/components/sub-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockCarbonTransactions } from "@/lib/mock-data/environmental"
import Link from "next/link"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

const portfolioData = [
  { name: "Nature", value: 70000, color: "#0D631B" },
  { name: "Renewable", value: 23400, color: "#005DB7" },
  { name: "Industrial", value: 16000, color: "#7A2FAA" },
]

export default function CarbonTransactionsPage() {
  return (
    <div className="flex w-full flex-col bg-[#F7F8FA] min-h-screen">
      {/* Top Header */}
      <header className="flex h-[72px] items-center justify-between border-b border-[#E2E8F0] bg-white px-8">
        <div className="flex items-center gap-3">
          <Leaf className="h-6 w-6 text-[#0D631B]" />
          <h1 className="text-[24px] font-semibold text-[#191C1E]">Environmental Module</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C]" />
            <Input
              placeholder="Search transactions..."
              className="h-[40px] w-full rounded-full border border-[#E2E8F0] bg-[#F7F8FA]/50 pl-9 focus-visible:ring-[#0D631B]"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#40493d] hover:bg-[#E2E8F0] transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      <SubTabs tabs={tabs} activeTabName="Carbon Transactions" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Breadcrumbs & Title Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#707A6C] mb-2">
                <span className="text-[#707A6C]">ENVIRONMENTAL</span>
                <span className="text-[#E2E8F0]">/</span>
                <span className="text-[#191C1E]">CARBON TRANSACTIONS</span>
              </div>
              <h2 className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">Carbon Credits Portfolio</h2>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-[40px] gap-2 border-[#E2E8F0] text-[#191C1E] font-semibold rounded-[8px] bg-white hover:bg-[#F7F8FA] transition-colors px-4">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button className="h-[40px] gap-2 bg-[#0D631B] hover:bg-[#1b6d24] text-white font-semibold rounded-[8px] px-4 transition-colors">
                <Plus className="h-4 w-4" />
                Buy Credits
              </Button>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: YTD Purchased */}
            <div className="rounded-[16px] border-l-4 border-l-[#0D631B] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">YTD Purchased</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[11px] font-bold text-[#0D631B]">
                  <ArrowUp className="h-3 w-3 stroke-[2.5]" /> +12%
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-[32px] font-bold text-[#191C1E] tracking-tight">12,450</span>
                <span className="text-[14px] text-[#707A6C] font-semibold mb-1">tCO2e</span>
              </div>
            </div>

            {/* Card 2: Carbon Balance */}
            <div className="rounded-[16px] border-l-4 border-l-[#005DB7] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Carbon Balance</span>
                <span className="text-[10px] bg-[#E1F0FF] text-[#005DB7] px-2 py-0.5 rounded-full font-bold uppercase tracking-[0.05em]">Real-time</span>
              </div>
              <div className="flex flex-col mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[#191C1E] tracking-tight">4,120</span>
                  <span className="text-[14px] text-[#707A6C] font-semibold">tCO2e</span>
                </div>
                <span className="text-[11px] text-[#707A6C] font-semibold mt-1">
                  Expiring within 12 months
                </span>
              </div>
            </div>

            {/* Card 3: Avg Unit Price */}
            <div className="rounded-[16px] border-l-4 border-l-[#7A2FAA] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Avg. Unit Price</span>
              <div className="flex flex-col mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[#191C1E] tracking-tight">$24.50</span>
                  <span className="text-[14px] text-[#707A6C] font-semibold">USD</span>
                </div>
                <span className="text-[11px] text-[#0D631B] font-bold mt-1 flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3 stroke-[2.5]" /> +4.2% from Q3
                </span>
              </div>
            </div>

            {/* Card 4: Total Invested */}
            <div className="rounded-[16px] border-l-4 border-l-[#2E7D32] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Total Invested</span>
              <div className="flex flex-col mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-[32px] font-bold text-[#191C1E] tracking-tight">$305.2k</span>
                  <span className="text-[14px] text-[#707A6C] font-semibold">USD</span>
                </div>
                <span className="text-[11px] text-[#707A6C] font-semibold mt-1">
                  18 verified projects
                </span>
              </div>
            </div>

          </div>

          {/* Transaction History Section */}
          <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
            
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-[18px] font-bold text-[#191C1E]">Transaction History</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[11px] font-bold text-[#0D631B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0D631B] animate-pulse"></span>
                  Live Ledger
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 border border-[#E2E8F0] text-[#707A6C] hover:bg-[#F7F8FA] hover:text-[#191C1E] transition-colors">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 border border-[#E2E8F0] text-[#707A6C] hover:bg-[#F7F8FA] hover:text-[#191C1E] transition-colors">
                  <Columns className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 border border-[#E2E8F0] text-[#707A6C] hover:bg-[#F7F8FA] hover:text-[#191C1E] transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Date</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Project Type</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Project Name</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Volume (tCO2e)</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Unit Price</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Total Cost</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Verification</TableHead>
                    <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCarbonTransactions.map((tx) => {
                    let TypeIcon = TreePine
                    let iconColor = "text-[#0D631B]"
                    let iconBg = "bg-[#E2F1E3]"
                    
                    if (tx.project_type === "Renewable") {
                      TypeIcon = Wind
                      iconColor = "text-[#005DB7]"
                      iconBg = "bg-[#E1F0FF]"
                    } else if (tx.project_type === "Methane Capture") {
                      TypeIcon = Droplet
                      iconColor = "text-[#7A2FAA]"
                      iconBg = "bg-[#F2ECF7]"
                    }

                    const verificationStyles = 
                      tx.verification === "Verra" ? "bg-[#E2F1E3] text-[#0D631B] border-[#0D631B]/10" :
                      tx.verification === "Gold Standard" ? "bg-[#E1F0FF] text-[#005DB7] border-[#005DB7]/10" :
                      "bg-[#F2ECF7] text-[#7A2FAA] border-[#7A2FAA]/10"

                    return (
                      <TableRow key={tx.id} className="h-[56px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                        <TableCell className="text-[13px] font-medium text-[#707A6C]">{tx.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-[13px] font-bold text-[#191C1E]">
                            <div className={`rounded-md p-1 ${iconBg} ${iconColor}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            {tx.project_type}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] font-bold text-[#191C1E]">{tx.project_name}</TableCell>
                        <TableCell className="text-[13px] font-bold text-[#191C1E] text-right">{tx.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-[13px] font-semibold text-[#707A6C] text-right">${tx.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-[13px] font-bold text-[#191C1E] text-right">${tx.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.02em] ${verificationStyles}`}>
                            {tx.verification}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <button className="rounded-lg p-1.5 hover:bg-[#F7F8FA] text-[#707A6C] hover:text-[#191C1E] transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Footer pagination */}
            <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
              <span className="text-[12px] font-semibold text-[#707A6C]">
                Showing 1 to 3 of 128 transactions
              </span>
              <div className="flex items-center gap-1.5">
                <Button disabled variant="outline" className="h-[32px] w-[32px] p-0 border-[#E2E8F0] text-[#707A6C] rounded-[6px]">
                  &lt;
                </Button>
                <span className="h-8 w-8 rounded-[6px] bg-[#0D631B] text-white flex items-center justify-center text-[12px] font-bold cursor-pointer">
                  1
                </span>
                <span className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] hover:bg-[#F7F8FA] text-[#40493d] flex items-center justify-center text-[12px] font-bold cursor-pointer transition-colors">
                  2
                </span>
                <span className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] hover:bg-[#F7F8FA] text-[#40493d] flex items-center justify-center text-[12px] font-bold cursor-pointer transition-colors">
                  3
                </span>
                <span className="text-[12px] font-semibold text-[#707A6C] px-1">...</span>
                <span className="h-8 w-8 rounded-[6px] border border-[#E2E8F0] hover:bg-[#F7F8FA] text-[#40493d] flex items-center justify-center text-[12px] font-bold cursor-pointer transition-colors">
                  24
                </span>
                <Button variant="outline" className="h-[32px] w-[32px] p-0 border-[#E2E8F0] text-[#40493d] rounded-[6px] hover:bg-[#F7F8FA]">
                  &gt;
                </Button>
              </div>
            </div>

          </div>

          {/* Bottom Row: Composition Chart & Audit Card */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left Box: Portfolio Composition */}
            <div className="lg:col-span-8 rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
                <h3 className="text-[16px] font-bold text-[#191C1E]">Portfolio Composition</h3>
                <div className="flex items-center gap-4 text-[12px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#0D631B]"></span>
                    <span className="text-[#40493d]">Nature (64%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#005DB7]"></span>
                    <span className="text-[#40493d]">Renewable (21%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#7A2FAA]"></span>
                    <span className="text-[#40493d]">Industrial (15%)</span>
                  </div>
                </div>
              </div>

              {/* Stacked Bar Chart representation */}
              <div className="flex-1 flex flex-col justify-center gap-3">
                <div className="h-[32px] w-full rounded-full overflow-hidden flex shadow-inner">
                  <div className="bg-[#0D631B] h-full" style={{ width: "64%" }} title="Nature: 64%"></div>
                  <div className="bg-[#005DB7] h-full" style={{ width: "21%" }} title="Renewable: 21%"></div>
                  <div className="bg-[#7A2FAA] h-full" style={{ width: "15%" }} title="Industrial: 15%"></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#707A6C] px-1">
                  <span>0 tCO2e</span>
                  <span>25,000 tCO2e</span>
                  <span>50,000 tCO2e</span>
                  <span>75,000 tCO2e</span>
                  <span>100,000 tCO2e</span>
                  <span>109,400 tCO2e</span>
                </div>
              </div>
            </div>

            {/* Right Box: Verification Audit */}
            <div className="lg:col-span-4 rounded-[16px] bg-[#E2F1E3]/20 border border-dashed border-[#0D631B]/40 p-6 flex flex-col justify-between min-h-[220px]">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-[18px] font-bold text-[#0D631B]">Verification Audit</h3>
                  <p className="text-[13px] text-[#40493d] font-medium leading-relaxed mt-2">
                    Your carbon offset portfolio is currently <strong className="text-[#0D631B] font-bold">92% verified</strong> through 3rd party standards. Perform an internal audit to bridge the gap.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border border-dashed border-[#0D631B]/30 rounded-xl bg-white/60 p-3 mt-auto cursor-pointer hover:bg-white/80 transition-colors">
                <span className="text-[13px] font-bold text-[#0D631B]">Trigger Verification Audit</span>
                <div className="rounded-lg bg-[#0D631B] p-1.5 text-white">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
