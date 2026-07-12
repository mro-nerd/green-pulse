"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Leaf, Bell, Search, Plus, ListFilter, ChevronDown, Database, Clock, FileText, Upload, ArrowUp, Loader2 } from "lucide-react"
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
import { apiFetch } from "@/lib/api"
import type { EmissionFactor, PaginatedResponse } from "@/lib/types"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

function getSector(activityType: string): string {
  if (activityType.includes("Gas") || activityType.includes("Electricity")) return "Energy"
  if (activityType.includes("Diesel") || activityType.includes("Jet")) return "Transport"
  if (activityType.includes("Refrigerant")) return "Fugitive Emissions"
  return "Supply Chain"
}

export default function EmissionFactorsPage() {
  const { data: session } = useSession()
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const pageSize = 15

  useEffect(() => {
    if (!session?.accessToken) return

    const fetchFactors = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/environmental/emission-factors?page=${page}&page_size=${pageSize}`
        if (search) {
          url += `&activityType=${encodeURIComponent(search)}`
        }
        const data = await apiFetch<PaginatedResponse<EmissionFactor>>(
          url,
          {},
          session.accessToken
        )
        setFactors(data.items)
        setTotal(data.total)
      } catch (err: any) {
        console.error("[EmissionFactors] Fetch error:", err)
        setError(err.detail || "Failed to load emission factors")
      } finally {
        setLoading(false)
      }
    }

    fetchFactors()
  }, [session?.accessToken, page, search])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
              placeholder="Search factors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="h-[40px] w-full rounded-full border border-[#E2E8F0] bg-[#F7F8FA]/50 pl-9 focus-visible:ring-[#0D631B]"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#40493d] hover:bg-[#E2E8F0] transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Sub Tabs */}
      <SubTabs tabs={tabs} activeTabName="Emission Factors" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Breadcrumbs & Title */}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#707A6C] mb-2">
              <span className="text-[#707A6C]">LIBRARY</span>
              <span className="text-[#E2E8F0]">/</span>
              <span className="text-[#191C1E]">EMISSION FACTORS</span>
            </div>
            <h2 className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">Global Emission Factors Library</h2>
            <p className="text-[14px] text-[#707A6C] mt-2 font-medium">
              Validated technical coefficients for carbon accounting protocols.
            </p>
          </div>

          {/* Metrics & Upload Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            
            {/* Card 1: Total Factors */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Total Factors</span>
                <div className="rounded-lg bg-[#E2F1E3] p-1.5 text-[#0D631B]">
                  <Database className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col mt-auto">
                <span className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">
                  {loading ? "—" : total.toLocaleString()}
                </span>
                <span className="text-[12px] text-[#0D631B] font-semibold mt-1 flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3 stroke-[2.5]" /> from API
                </span>
              </div>
            </div>

            {/* Card 2: Avg Data Age */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Avg Data Age</span>
                <div className="rounded-lg bg-[#E1F0FF] p-1.5 text-[#005DB7]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col mt-auto">
                <span className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">—</span>
                <span className="text-[12px] text-[#707A6C] font-semibold mt-1">
                  Computed from effective dates
                </span>
              </div>
            </div>

            {/* Card 3: Data Sources */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[135px]">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#707A6C]">Data Sources</span>
                <div className="rounded-lg bg-[#F2ECF7] p-1.5 text-[#7A2FAA]">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="flex flex-col mt-auto">
                <span className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">
                  {loading ? "—" : new Set(factors.map(f => f.source)).size}
                </span>
                <span className="text-[12px] text-[#7A2FAA] font-semibold mt-1">
                  Unique sources in current page
                </span>
              </div>
            </div>

            {/* Card 4: Import Custom Data */}
            <div className="rounded-[16px] border border-dashed border-[#0D631B]/40 bg-[#E2F1E3]/20 hover:bg-[#E2F1E3]/35 cursor-pointer p-6 flex flex-col justify-between h-[135px] transition-colors">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-[#0D631B]">Import Custom Data</span>
                <span className="text-[11px] text-[#707A6C] font-semibold">Batch upload factors via CSV/JSON.</span>
              </div>
              <div className="border border-dashed border-[#0D631B]/30 rounded-[8px] bg-white/60 p-2 flex items-center justify-center gap-2 mt-auto">
                <Upload className="h-3.5 w-3.5 text-[#0D631B]" />
                <span className="text-[11px] font-bold text-[#0D631B]">Click to upload or drag & drop</span>
              </div>
            </div>

          </div>

          {/* Data Section Container */}
          <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button className="h-[36px] bg-[#0D631B] hover:bg-[#1b6d24] text-white gap-1.5 px-3 font-semibold rounded-[8px]">
                  <Plus className="h-4 w-4" />
                  New Factor
                </Button>
                <Button variant="outline" className="h-[36px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d] font-semibold rounded-[8px] hover:bg-[#F7F8FA]">
                  <ListFilter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" className="h-[36px] gap-1.5 px-3 border-[#E2E8F0] text-[#40493d] font-semibold rounded-[8px] hover:bg-[#F7F8FA]">
                  Export
                  <ChevronDown className="h-4 w-4 text-[#707A6C]" />
                </Button>
              </div>

              {/* Toolbar Search */}
              <div className="relative w-full sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#707A6C]" />
                <Input
                  placeholder="Search factors..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="h-[36px] w-full pl-9 rounded-[8px] border-[#E2E8F0] bg-white focus-visible:ring-[#0D631B] text-[13px]"
                />
              </div>
            </div>

            {/* Table Header and Count */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex gap-2">
                <button className="rounded-[6px] bg-[#0D631B] px-4 py-1.5 text-[12px] font-bold text-white transition-colors">
                  ALL
                </button>
              </div>
              <span className="text-[12px] font-semibold text-[#707A6C]">
                {loading ? "Loading..." : `Showing ${factors.length} of ${total.toLocaleString()}`}
              </span>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#0D631B]" />
                <span className="ml-3 text-[14px] text-[#707A6C]">Loading emission factors...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[14px] font-medium text-[#BA1A1A]">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4 text-[13px]"
                  onClick={() => setPage(page)}
                >
                  Retry
                </Button>
              </div>
            ) : factors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-10 w-10 text-[#E2E8F0] mb-3" />
                <p className="text-[14px] font-medium text-[#707A6C]">No emission factors found</p>
                <p className="text-[12px] text-[#707A6C] mt-1">Add your first emission factor to get started</p>
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Source / Fuel</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Sector</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Factor (kgCO2e)</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Unit</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Data Source</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Year</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {factors.map((factor) => {
                      const isCustom = factor.source.startsWith("CUSTOM")
                      const badgeBg = isCustom ? "bg-[#E1E2E4] text-[#40493d]" : "bg-[#E1F0FF] text-[#005DB7]"
                      
                      return (
                        <TableRow key={factor.id} className="h-[52px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                          <TableCell className="text-[13px] font-semibold text-[#191C1E]">{factor.activityType}</TableCell>
                          <TableCell className="text-[13px] text-[#40493d] font-medium">{getSector(factor.activityType)}</TableCell>
                          <TableCell className="text-[13px] text-[#0D631B] font-bold text-right">{factor.co2PerUnit.toFixed(4)}</TableCell>
                          <TableCell className="text-[13px] text-[#40493d] font-semibold">{factor.unit}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] ${badgeBg}`}>
                              {factor.source}
                            </span>
                          </TableCell>
                          <TableCell className="text-[13px] text-[#40493d] font-medium">
                            {factor.effectiveDate.split("-")[0] || factor.effectiveDate.split("T")[0]}
                          </TableCell>
                          <TableCell className="text-right">
                            <button className="text-[12px] font-bold text-[#0D631B] hover:text-[#1b6d24] transition-colors">
                              Edit
                            </button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
                <span className="text-[12px] font-semibold text-[#707A6C]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={page <= 1}
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    className="h-[32px] px-3 border-[#E2E8F0] text-[#707A6C] rounded-[6px] text-[12px] font-semibold"
                  >
                    Prev
                  </Button>
                  <span className="h-8 w-8 rounded-[6px] bg-[#0D631B] text-white flex items-center justify-center text-[12px] font-bold">
                    {page}
                  </span>
                  <Button
                    disabled={page >= totalPages}
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    className="h-[32px] px-3 border-[#E2E8F0] text-[#40493d] rounded-[6px] text-[12px] font-semibold hover:bg-[#F7F8FA]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  )
}
