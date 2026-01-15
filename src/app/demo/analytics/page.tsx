'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

interface ProjectPerformance {
  id: string
  name: string
  revenue: number
  costs: number
  margin: number
  marginPercent: number
  status: 'active' | 'completed'
}

const MOCK_PROJECTS: ProjectPerformance[] = [
  { id: '1', name: 'Wohnanlage Sonnenhang', revenue: 485000, costs: 362000, margin: 123000, marginPercent: 25.4, status: 'active' },
  { id: '2', name: 'Bürogebäude München', revenue: 824000, costs: 658000, margin: 166000, marginPercent: 20.1, status: 'active' },
  { id: '3', name: 'Schulkomplex Stuttgart', revenue: 312000, costs: 268000, margin: 44000, marginPercent: 14.1, status: 'active' },
  { id: '4', name: 'Hotelumbau Berlin', revenue: 1240000, costs: 980000, margin: 260000, marginPercent: 21.0, status: 'completed' },
  { id: '5', name: 'Lagerhalle Hamburg', revenue: 156000, costs: 142000, margin: 14000, marginPercent: 9.0, status: 'completed' },
]

const MONTHLY_DATA = [
  { month: 'Aug', revenue: 420000, costs: 340000 },
  { month: 'Sep', revenue: 380000, costs: 295000 },
  { month: 'Oct', revenue: 510000, costs: 390000 },
  { month: 'Nov', revenue: 445000, costs: 355000 },
  { month: 'Dez', revenue: 620000, costs: 485000 },
  { month: 'Jan', revenue: 580000, costs: 445000 },
]

const TRANSLATIONS = {
  de: {
    title: 'Erfolgs-Dashboard',
    subtitle: 'Margen-Analyse und Performance-Kennzahlen',
    overview: 'Übersicht',
    projects: 'Projekte',
    totalRevenue: 'Gesamtumsatz',
    totalMargin: 'Gesamtmarge',
    avgMargin: 'Ø Marge',
    activeProjects: 'Aktive Projekte',
    projectName: 'Projekt',
    revenue: 'Umsatz',
    costs: 'Kosten',
    margin: 'Marge',
    marginPercent: '% Marge',
    status: 'Status',
    active: 'Aktiv',
    completed: 'Abgeschlossen',
    monthlyTrend: 'Monatlicher Verlauf',
    last6Months: 'Letzte 6 Monate',
    topPerformer: 'Top-Performer',
    needsAttention: 'Kritisch',
  },
  en: {
    title: 'Performance Dashboard',
    subtitle: 'Margin analysis and performance metrics',
    overview: 'Overview',
    projects: 'Projects',
    totalRevenue: 'Total Revenue',
    totalMargin: 'Total Margin',
    avgMargin: 'Avg. Margin',
    activeProjects: 'Active Projects',
    projectName: 'Project',
    revenue: 'Revenue',
    costs: 'Costs',
    margin: 'Margin',
    marginPercent: '% Margin',
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    monthlyTrend: 'Monthly Trend',
    last6Months: 'Last 6 Months',
    topPerformer: 'Top Performer',
    needsAttention: 'Critical',
  }
}

export default function AnalyticsPage() {
  const [lang, setLang] = useState<Language>('de')
  const t = TRANSLATIONS[lang]

  const totalRevenue = MOCK_PROJECTS.reduce((s, p) => s + p.revenue, 0)
  const totalMargin = MOCK_PROJECTS.reduce((s, p) => s + p.margin, 0)
  const avgMargin = totalMargin / totalRevenue * 100
  const activeCount = MOCK_PROJECTS.filter(p => p.status === 'active').length

  const maxMonthlyRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue))

  const getMarginColor = (percent: number) => {
    if (percent >= 20) return 'text-emerald-600'
    if (percent >= 15) return 'text-amber-600'
    return 'text-red-600'
  }

  const getMarginBg = (percent: number) => {
    if (percent >= 20) return 'bg-emerald-100'
    if (percent >= 15) return 'bg-amber-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900 brand-font">
            Angebots<span className="text-blue-700 italic">Agent</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-slate-100 rounded-full p-1">
            <button onClick={() => setLang('de')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'de' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>EN</button>
          </div>
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">JD</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
            <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
            <p className="text-slate-500 mt-1">{t.subtitle}</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.totalRevenue}</p>
              <p className="text-3xl font-black text-slate-900">€ {(totalRevenue / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-emerald-600 font-bold mt-2">↑ 12.4% vs. Vorjahr</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.totalMargin}</p>
              <p className="text-3xl font-black text-emerald-600">€ {(totalMargin / 1000).toFixed(0)}K</p>
              <p className="text-xs text-emerald-600 font-bold mt-2">↑ 8.2% vs. Vorjahr</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.avgMargin}</p>
              <p className="text-3xl font-black text-blue-600">{avgMargin.toFixed(1)}%</p>
              <p className="text-xs text-slate-500 font-bold mt-2">Ziel: 20%</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.activeProjects}</p>
              <p className="text-3xl font-black text-slate-900">{activeCount}</p>
              <p className="text-xs text-amber-600 font-bold mt-2">1 {t.needsAttention}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Monthly Chart */}
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.monthlyTrend}</h3>
              <div className="flex items-end space-x-4 h-48">
                {MONTHLY_DATA.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex space-x-1 items-end" style={{ height: '140px' }}>
                      <div
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${(data.revenue / maxMonthlyRevenue) * 100}%` }}
                        title={`${t.revenue}: €${(data.revenue / 1000).toFixed(0)}K`}
                      />
                      <div
                        className="flex-1 bg-slate-300 rounded-t"
                        style={{ height: `${(data.costs / maxMonthlyRevenue) * 100}%` }}
                        title={`${t.costs}: €${(data.costs / 1000).toFixed(0)}K`}
                      />
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-2">{data.month}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-xs font-medium text-slate-600">{t.revenue}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-slate-300 rounded" />
                  <span className="text-xs font-medium text-slate-600">{t.costs}</span>
                </div>
              </div>
            </div>

            {/* Top/Bottom Performers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">{t.topPerformer}</h3>
              <div className="space-y-4">
                {MOCK_PROJECTS.sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 3).map((project, idx) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${idx === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 truncate max-w-[140px]">{project.name}</span>
                    </div>
                    <span className={`text-sm font-black ${getMarginColor(project.marginPercent)}`}>
                      {project.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 mt-8">{t.needsAttention}</h3>
              <div className="space-y-4">
                {MOCK_PROJECTS.filter(p => p.marginPercent < 15).map(project => (
                  <div key={project.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{project.name}</span>
                    <span className={`text-sm font-black ${getMarginColor(project.marginPercent)}`}>
                      {project.marginPercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t.projects}</h3>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">{t.projectName}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.revenue}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.costs}</th>
                  <th className="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">{t.margin}</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.marginPercent}</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PROJECTS.map(project => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{project.name}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-700">€ {project.revenue.toLocaleString('de-DE')}</td>
                    <td className="px-4 py-4 text-right text-sm text-slate-500">€ {project.costs.toLocaleString('de-DE')}</td>
                    <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">€ {project.margin.toLocaleString('de-DE')}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-black ${getMarginBg(project.marginPercent)} ${getMarginColor(project.marginPercent)}`}>
                        {project.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${project.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {project.status === 'active' ? t.active : t.completed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
