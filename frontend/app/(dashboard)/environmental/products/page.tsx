"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Leaf, Bell, Search, ListFilter, Download, ArrowUp, ArrowDown, ChevronRight, Plus, Loader2, Package } from "lucide-react"
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
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import type { ProductEsgProfile, PaginatedResponse } from "@/lib/types"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

export default function ProductESGProfilesPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<ProductEsgProfile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const pageSize = 15

  useEffect(() => {
    if (!session?.accessToken) return

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        let url = `/environmental/product-esg-profiles?page=${page}&page_size=${pageSize}`
        if (search) {
          url += `&productName=${encodeURIComponent(search)}`
        }
        const data = await apiFetch<PaginatedResponse<ProductEsgProfile>>(
          url,
          {},
          session.accessToken
        )
        setProducts(data.items)
        setTotal(data.total)
      } catch (err: any) {
        console.error("[ProductESGProfiles] Fetch error:", err)
        setError(err.detail || "Failed to load product profiles")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [session?.accessToken, page, search])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // KPI Calculations
  const avgFootprint = products.length 
    ? products.reduce((acc, p) => acc + p.carbonFootprint, 0) / products.length 
    : 0
  const avgRecyclable = products.length 
    ? products.reduce((acc, p) => acc + p.recyclablePct, 0) / products.length 
    : 0

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
              placeholder="Search products..."
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
      <SubTabs tabs={tabs} activeTabName="Product ESG Profiles" activeColor="#0D631B" />

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Breadcrumbs & Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#707A6C] mb-2">
                <Link href="/environmental" className="hover:text-[#191C1E] transition-colors">Environmental</Link>
                <ChevronRight className="h-3 w-3 text-[#707A6C]" />
                <span className="text-[#191C1E]">Product ESG Profiles</span>
              </div>
              <h2 className="text-[32px] font-bold text-[#191C1E] tracking-tight leading-none">Product ESG Profiles</h2>
              <p className="text-[14px] text-[#707A6C] mt-2 font-medium">
                Sustainability metrics and lifecycle analysis across the product portfolio.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-[40px] gap-2 border-[#E2E8F0] text-[#191C1E] font-semibold rounded-[8px] bg-white hover:bg-[#F7F8FA] transition-colors px-4">
                <ListFilter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="h-[40px] gap-2 bg-[#0D631B] hover:bg-[#1b6d24] text-white font-semibold rounded-[8px] px-4 transition-colors">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Card 1: Total Managed SKUs */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Total Managed SKUs</span>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">
                  {loading ? "—" : total.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[12px] font-semibold text-[#0D631B]">
                  Live <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                </span>
              </div>
            </div>

            {/* Card 2: Avg. Carbon Footprint */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Avg. Carbon Footprint</span>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">
                  {loading ? "—" : avgFootprint.toFixed(1)}kg
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[12px] font-semibold text-[#0D631B]">
                  Current Page
                </span>
              </div>
            </div>

            {/* Card 3: Avg Recyclability */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Avg Recyclability</span>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">
                  {loading ? "—" : avgRecyclable.toFixed(1)}%
                </span>
                <span className="text-[13px] text-[#707A6C] font-semibold mb-1">Current Page</span>
              </div>
            </div>

            {/* Card 4: Portfolio Grade */}
            <div className="relative overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Portfolio Grade</span>
              <div className="flex items-baseline mt-auto">
                <span className="text-[40px] font-bold text-[#0D631B] tracking-tight leading-none">A-</span>
              </div>
              <div className="absolute right-4 bottom-4 opacity-[0.08]">
                <Leaf className="h-16 w-16 text-[#0D631B]" />
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
                  New Product
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="rounded-full bg-[#0D631B] px-5 py-2 text-[13px] font-bold text-white transition-colors shadow-[0_2px_4px_rgba(13,99,27,0.15)]">
                  All Products
                </button>
              </div>
            </div>

            {/* Table Header and Count */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <span className="text-[12px] font-semibold text-[#707A6C]">
                {loading ? "Loading..." : `Showing ${products.length} of ${total.toLocaleString()}`}
              </span>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#0D631B]" />
                <span className="ml-3 text-[14px] text-[#707A6C]">Loading products...</span>
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
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-10 w-10 text-[#E2E8F0] mb-3" />
                <p className="text-[14px] font-medium text-[#707A6C]">No product profiles found</p>
                <p className="text-[12px] text-[#707A6C] mt-1">Add your first product to get started</p>
              </div>
            ) : (
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-[#E2E8F0] hover:bg-transparent">
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Product Name</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">SKU</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Carbon Footprint (kg CO2e)</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Recyclability</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d]">Notes</TableHead>
                      <TableHead className="h-10 text-[11px] font-bold uppercase tracking-[0.05em] text-[#40493d] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      return (
                        <TableRow key={product.id} className="h-[52px] border-b-[#E2E8F0] hover:bg-[#F7F8FA]/50">
                          <TableCell className="text-[13px] font-semibold text-[#191C1E]">{product.productName}</TableCell>
                          <TableCell className="text-[13px] text-[#40493d] font-medium">{product.sku}</TableCell>
                          <TableCell className="text-[13px] text-[#0D631B] font-bold text-right">{product.carbonFootprint.toFixed(2)}</TableCell>
                          <TableCell className="text-[13px] text-[#40493d] font-semibold text-right">{product.recyclablePct.toFixed(1)}%</TableCell>
                          <TableCell className="text-[13px] text-[#707A6C] max-w-[200px] truncate">{product.notes || "—"}</TableCell>
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
