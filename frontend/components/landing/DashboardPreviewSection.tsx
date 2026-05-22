'use client';

import { FileText, MessageSquare, Zap, LayoutDashboard, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

// Mockup data (static, representative of real dashboard)
const MOCK_STATS = [
  { label: 'Documents Processed', value: '12', max: '20', pct: 60, icon: FileText, color: 'text-primary' },
  { label: 'Queries this month', value: '1,847', max: '2,000', pct: 92, icon: MessageSquare, color: 'text-emerald-400' },
  { label: 'Current Plan', value: 'Enterprise', icon: Zap, color: 'text-[#7C4DFF]' },
];

const MOCK_DOCS = [
  { name: 'Product_Handbook_v3.pdf', type: 'PDF', chunks: 128, status: 'Active' },
  { name: 'API_Reference_Guide.docx', type: 'DOCX', chunks: 84, status: 'Active' },
  { name: 'Customer_FAQ.txt', type: 'TXT', chunks: 37, status: 'Indexing' },
  { name: 'Onboarding_Checklist.pdf', type: 'PDF', chunks: 0, status: 'Pending' },
];

const STATUS_CLASS: Record<string, string> = {
  Active: 'badge-green',
  Indexing: 'badge-yellow',
  Pending: 'badge-gray',
  Failed: 'badge-red',
};

export function DashboardPreviewSection() {
  return (
    <section id="dashboard-preview" className="relative overflow-hidden py-32 z-10">
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Control Center</span>
          </div>
          <h2 className="text-[2.5rem] font-bold tracking-tight text-text-primary md:text-[3rem]">
            Mission Control for your AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Monitor your knowledge base, track query volume, and manage API keys from a single, beautiful interface.
          </p>
        </div>

        {/* Dashboard mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-glass relative"
        >
          {/* Top subtle glow inside the container */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Browser chrome / Top bar */}
          <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-status-danger/80" />
              <span className="h-3 w-3 rounded-full bg-status-warning/80" />
              <span className="h-3 w-3 rounded-full bg-status-success/80" />
            </div>
            
            <div className="flex items-center gap-4">
              <Search className="h-4 w-4 text-text-secondary" />
              <Bell className="h-4 w-4 text-text-secondary" />
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary-accent" />
            </div>
          </div>

          {/* Inner layout */}
          <div className="flex h-[500px]">
            {/* Sidebar strip */}
            <div className="hidden w-16 flex-col items-center gap-6 border-r border-border bg-surface/30 py-6 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 shadow-glow-primary mb-2">
                <span className="text-[12px] font-bold text-primary">CH</span>
              </div>
              {[LayoutDashboard, FileText, MessageSquare, Zap].map((Icon, i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors cursor-pointer ${i === 0 ? 'bg-card border border-border text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-6 p-8 overflow-y-auto">
              {/* Welcome row */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">Welcome back, Acme Corp</h3>
                  <p className="text-sm text-text-secondary mt-1">Here's what's happening with your AI agents today.</p>
                </div>
                <button className="btn-primary !py-2 !px-4 text-sm hidden sm:flex">
                  Upload Document
                </button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MOCK_STATS.map(({ label, value, max, pct, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-border bg-surface/50 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-text-primary">
                          {value}
                          {max && <span className="text-sm font-normal text-text-secondary"> /{max}</span>}
                        </p>
                      </div>
                      <div className={`rounded-lg p-2 bg-card border border-border ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    {pct !== undefined && (
                      <div className="mt-4">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                          <div
                            className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-status-danger' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Documents list */}
              <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-card/50 px-6 py-4">
                  <h4 className="text-sm font-bold text-text-primary">Recent Knowledge</h4>
                  <a href="#" className="text-xs font-medium text-primary hover:text-primary-accent transition-colors">View all</a>
                </div>
                <div className="divide-y divide-border">
                  {MOCK_DOCS.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between px-6 py-4 hover:bg-card/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
                          <FileText className="h-5 w-5 text-text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">{doc.type}</span>
                            <span className="text-text-secondary text-[10px]">•</span>
                            <span className="text-[10px] text-text-secondary">{doc.chunks > 0 ? `${doc.chunks} chunks` : 'Processing'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`${STATUS_CLASS[doc.status]}`}>{doc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
