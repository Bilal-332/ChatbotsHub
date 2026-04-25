import { FileText, MessageSquare, Zap, LayoutDashboard } from 'lucide-react';

// Mockup data (static, representative of real dashboard)
const MOCK_STATS = [
  { label: 'Documents', value: '12', max: '20', pct: 60, icon: FileText, color: 'bg-primary-600' },
  { label: 'Queries this month', value: '1,847', max: '2,000', pct: 92, icon: MessageSquare, color: 'bg-emerald-600' },
  { label: 'Plan', value: 'STARTER', icon: Zap, color: 'bg-amber-500' },
];

const MOCK_DOCS = [
  { name: 'Product Handbook v3.pdf', type: 'PDF', chunks: 128, status: 'ready' },
  { name: 'API Reference Guide.docx', type: 'DOCX', chunks: 84, status: 'ready' },
  { name: 'Customer FAQ.txt', type: 'TXT', chunks: 37, status: 'processing' },
  { name: 'Onboarding Checklist.pdf', type: 'PDF', chunks: 0, status: 'pending' },
];

const STATUS_CLASS: Record<string, string> = {
  ready: 'badge-green',
  processing: 'badge-yellow',
  pending: 'badge-gray',
  failed: 'badge-red',
};

export function DashboardPreviewSection() {
  return (
    <section className="relative overflow-hidden bg-gray-50 py-28">
      {/* Subtle dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, #c7d2fe 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.45,
        }}
      />
      {/* Fade top/bottom */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-gray-50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
            Dashboard
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Powerful, yet simple
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-gray-500">
            Monitor your documents, track usage, and manage everything from one clean interface.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/80">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <div className="mx-auto flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1">
              <LayoutDashboard className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">app.chatbotshub.io/dashboard</span>
            </div>
          </div>

          {/* Inner layout */}
          <div className="flex">
            {/* Sidebar strip */}
            <div className="hidden w-14 flex-col items-center gap-5 border-r border-gray-100 bg-gray-900 py-5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-[10px] font-bold text-white">CH</span>
              </div>
              {[FileText, MessageSquare, Zap].map((Icon, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === 0 ? 'bg-gray-700' : ''}`}
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-5 p-6">
              {/* Welcome row */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Welcome back, Acme Corp 👋</h3>
                  <p className="text-xs text-gray-400">Here&apos;s your knowledge base overview</p>
                </div>
                <span className="badge-blue text-[11px]">starter plan</span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {MOCK_STATS.map(({ label, value, max, pct, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] text-gray-400">{label}</p>
                        <p className="mt-0.5 text-xl font-bold text-gray-900">
                          {value}
                          {max && <span className="text-xs font-normal text-gray-400"> /{max}</span>}
                        </p>
                      </div>
                      <div className={`rounded-lg p-2 ${color}`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    {pct !== undefined && (
                      <div className="mt-2.5">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-1 rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-primary-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-400">{pct}% used</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Documents list */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Recent Documents</h4>
                  <a href="#" className="text-[11px] font-medium text-primary-600">View all</a>
                </div>
                <div className="divide-y divide-gray-50">
                  {MOCK_DOCS.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100">
                          <FileText className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                        <div>
                          <p className="max-w-[180px] truncate text-xs font-medium text-gray-800">{doc.name}</p>
                          <p className="text-[10px] uppercase text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.chunks > 0 && (
                          <span className="text-[10px] text-gray-400">{doc.chunks} chunks</span>
                        )}
                        <span className={`${STATUS_CLASS[doc.status]} text-[10px]`}>{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
