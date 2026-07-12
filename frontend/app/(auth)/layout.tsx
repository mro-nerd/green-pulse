export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-md shadow-sm border border-[#E2E8F0]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d631b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h4l2-6 4 12 2-6h6" />
          </svg>
          <span className="text-[14px] font-bold text-[#0d631b] tracking-tight">GreenPulse</span>
        </div>
      </div>
      {children}
    </div>
  )
}
