import { Leaf, Bell, Search, ListFilter, Download, ArrowUp, ArrowDown, ChevronRight } from "lucide-react"
import { SubTabs } from "@/components/sub-tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const tabs = [
  { name: "Emission Factors", href: "/environmental/emission-factors" },
  { name: "Product ESG Profiles", href: "/environmental/products" },
  { name: "Carbon Transactions", href: "/environmental/transactions" },
  { name: "Environmental Goals", href: "/environmental" },
]

export default function ProductESGProfilesPage() {
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
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">1,248</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[12px] font-semibold text-[#0D631B]">
                  +4% <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                </span>
              </div>
            </div>

            {/* Card 2: Avg. Carbon Footprint */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Avg. Carbon Footprint</span>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">2.4kg</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E2F1E3] px-2.5 py-0.5 text-[12px] font-semibold text-[#0D631B]">
                  -12% <ArrowDown className="h-3 w-3 stroke-[2.5]" />
                </span>
              </div>
            </div>

            {/* Card 3: Platinum Tier Products */}
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[140px]">
              <span className="text-[14px] font-semibold text-[#707A6C] uppercase tracking-[0.05em]">Platinum Tier Products</span>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-[36px] font-bold text-[#191C1E] tracking-tight">84</span>
                <span className="text-[13px] text-[#707A6C] font-semibold mb-1">6.7% of total</span>
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

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="rounded-full bg-[#0D631B] px-5 py-2.5 text-[13px] font-bold text-white transition-colors shadow-[0_2px_4px_rgba(13,99,27,0.15)]">
              All Products
            </button>
            <button className="rounded-full border border-[#E2E8F0] bg-[#E1E2E4]/60 px-5 py-2.5 text-[13px] font-bold text-[#40493d] hover:bg-[#D2D3D5]/80 transition-colors">
              Electronics
            </button>
            <button className="rounded-full border border-[#E2E8F0] bg-[#E1E2E4]/60 px-5 py-2.5 text-[13px] font-bold text-[#40493d] hover:bg-[#D2D3D5]/80 transition-colors">
              Industrial Components
            </button>
            <button className="rounded-full border border-[#E2E8F0] bg-[#E1E2E4]/60 px-5 py-2.5 text-[13px] font-bold text-[#40493d] hover:bg-[#D2D3D5]/80 transition-colors">
              Packaging
            </button>
            <button className="rounded-full border border-[#E2E8F0] bg-[#E1E2E4]/60 px-5 py-2.5 text-[13px] font-bold text-[#40493d] hover:bg-[#D2D3D5]/80 transition-colors">
              Textiles
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
