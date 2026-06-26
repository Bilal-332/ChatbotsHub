'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  MessageSquare,
  Users,
  MessagesSquare,
  UserPlus,
  Gauge,
  Clock,
  TrendingDown,
  CheckCircle2,
  HelpCircle,
  Target,
  Loader2,
} from 'lucide-react';
import { analyticsApi } from '@/lib/api';
import type { AnalyticsRange } from '@/types/index';
import { StatCard } from '@/components/analytics/StatCard';
import { ChartCard } from '@/components/analytics/ChartCard';
import { DateRangeFilter } from '@/components/analytics/DateRangeFilter';
import { GlassCard } from '@/components/shared/GlassCard';

const AXIS_COLOR = '#8B93B0';
const GRID_COLOR = 'rgba(255,255,255,0.06)';

const tooltipStyle = {
  backgroundColor: '#12182D',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.75rem',
  color: '#fff',
  fontSize: '12px',
};

function formatDay(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const enabled = range !== 'custom' || (Boolean(from) && Boolean(to));
  const key = useMemo(() => [range, from, to] as const, [range, from, to]);

  const overview = useQuery({
    queryKey: ['analytics', 'overview', ...key],
    queryFn: () => analyticsApi.overview(range, from, to).then((r) => r.data.data),
    enabled,
  });
  const engagement = useQuery({
    queryKey: ['analytics', 'engagement', ...key],
    queryFn: () => analyticsApi.engagement(range, from, to).then((r) => r.data.data),
    enabled,
  });
  const knowledge = useQuery({
    queryKey: ['analytics', 'knowledge', ...key],
    queryFn: () => analyticsApi.knowledge(range, from, to).then((r) => r.data.data),
    enabled,
  });
  const topQuestions = useQuery({
    queryKey: ['analytics', 'top-questions', ...key],
    queryFn: () => analyticsApi.topQuestions(range, from, to).then((r) => r.data.data),
    enabled,
  });
  const timeseries = useQuery({
    queryKey: ['analytics', 'timeseries', ...key],
    queryFn: () => analyticsApi.timeseries(range, from, to).then((r) => r.data.data),
    enabled,
  });
  const leadStats = useQuery({
    queryKey: ['analytics', 'leads', ...key],
    queryFn: () => analyticsApi.leads(range, from, to).then((r) => r.data.data),
    enabled,
  });

  const series = useMemo(
    () => (timeseries.data ?? []).map((p) => ({ ...p, label: formatDay(p.date) })),
    [timeseries.data],
  );
  const leadsSeries = useMemo(
    () => (leadStats.data?.leadsPerDay ?? []).map((p) => ({ ...p, label: formatDay(p.date) })),
    [leadStats.data],
  );
  const topQuestionsData = useMemo(
    () =>
      (topQuestions.data ?? []).map((q) => ({
        ...q,
        label: q.question.length > 40 ? `${q.question.slice(0, 40)}…` : q.question,
      })),
    [topQuestions.data],
  );

  const isInitialLoading = overview.isLoading && enabled;

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Understand how visitors engage with your chatbot and how well it answers.
        </p>
      </motion.div>

      <DateRangeFilter
        range={range}
        from={from}
        to={to}
        onChange={(next) => {
          setRange(next.range);
          setFrom(next.from);
          setTo(next.to);
        }}
      />

      {range === 'custom' && !enabled && (
        <div className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-text-secondary">
          Select a start and end date to view custom-range analytics.
        </div>
      )}

      {isInitialLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {enabled && !isInitialLoading && (
        <>
          {/* Overview */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Conversations" value={overview.data?.totalConversations ?? 0} icon={MessageSquare} />
              <StatCard label="Unique Visitors" value={overview.data?.uniqueVisitors ?? 0} icon={Users} />
              <StatCard label="Total Messages" value={overview.data?.totalMessages ?? 0} icon={MessagesSquare} />
              <StatCard label="Leads Generated" value={overview.data?.leadsGenerated ?? 0} icon={UserPlus} />
            </div>
          </section>

          {/* Engagement & Lead Analytics */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Engagement &amp; Lead Analytics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Avg Messages / Session"
                value={engagement.data?.avgMessagesPerSession ?? 0}
                icon={Gauge}
              />
              <StatCard
                label="Avg Session Duration"
                value={formatDuration(engagement.data?.avgSessionDurationSeconds ?? 0)}
                icon={Clock}
              />
              <StatCard
                label="Bounce Rate"
                value={`${Math.round((engagement.data?.bounceRate ?? 0) * 100)}%`}
                icon={TrendingDown}
                hint="Single-message sessions"
              />
              <StatCard label="Total Leads" value={leadStats.data?.totalLeads ?? 0} icon={UserPlus} />
              <StatCard
                label="Conversion Rate"
                value={`${Math.round((leadStats.data?.conversionRate ?? 0) * 100)}%`}
                icon={Target}
                hint="Leads per conversation"
              />
            </div>
          </section>

          {/* Knowledge quality */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Knowledge Quality</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Answered" value={knowledge.data?.answeredQueries ?? 0} icon={CheckCircle2} />
              <StatCard label="Unanswered" value={knowledge.data?.unansweredQueries ?? 0} icon={HelpCircle} />
              <StatCard
                label="Answer Rate"
                value={`${Math.round((knowledge.data?.answerRate ?? 0) * 100)}%`}
                icon={Target}
              />
              <StatCard
                label="Avg Confidence"
                value={`${Math.round((knowledge.data?.avgConfidence ?? 0) * 100)}%`}
                icon={Gauge}
              />
            </div>
          </section>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Conversations Over Time" subtitle="Daily conversations and messages">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={11} tickLine={false} />
                  <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="conversations" name="Conversations" stroke="#5B6CFF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="messages" name="Messages" stroke="#7C4DFF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Leads Over Time" subtitle="Daily captured leads">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={leadsSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={11} tickLine={false} />
                  <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="leads" name="Leads" fill="#5B6CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Engagement Trend" subtitle="Answered vs unanswered queries">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={series} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={11} tickLine={false} />
                  <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="answered" name="Answered" stroke="#22C55E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="unanswered" name="Unanswered" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Questions" subtitle="Most asked questions in this period">
              {topQuestionsData.length === 0 ? (
                <div className="flex h-[260px] items-center justify-center text-sm text-text-secondary">
                  No questions recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={topQuestionsData}
                    layout="vertical"
                    margin={{ top: 5, right: 16, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
                    <XAxis type="number" stroke={AXIS_COLOR} fontSize={11} tickLine={false} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      stroke={AXIS_COLOR}
                      fontSize={11}
                      tickLine={false}
                      width={140}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="count" name="Count" fill="#7C4DFF" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Top questions table */}
          {topQuestionsData.length > 0 && (
            <GlassCard className="overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wider text-text-secondary">
                      <th className="px-4 py-3 font-medium">Question</th>
                      <th className="px-4 py-3 font-medium text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topQuestions.data ?? []).map((q, i) => (
                      <tr key={`${q.question}-${i}`} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 text-text-primary">{q.question}</td>
                        <td className="px-4 py-3 text-right font-medium text-text-secondary">{q.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
