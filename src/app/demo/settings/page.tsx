'use client'

import { useState } from 'react'
import Link from 'next/link'

type Language = 'de' | 'en'

const TRANSLATIONS = {
  de: {
    title: 'Einstellungen',
    subtitle: 'Systemeinstellungen und Präferenzen konfigurieren',
    general: 'Allgemein',
    company: 'Firmendaten',
    companyName: 'Firmenname',
    address: 'Adresse',
    taxId: 'Steuernummer',
    email: 'E-Mail',
    phone: 'Telefon',
    defaults: 'Standardwerte',
    defaultMargin: 'Standard-Marge',
    defaultCurrency: 'Währung',
    defaultVat: 'MwSt.-Satz',
    notifications: 'Benachrichtigungen',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    emailNotificationsDesc: 'Benachrichtigungen bei wichtigen Ereignissen erhalten',
    weeklyReport: 'Wöchentlicher Bericht',
    weeklyReportDesc: 'Automatischer Zusammenfassungsbericht jeden Montag',
    overdueAlerts: 'Überfälligkeits-Warnungen',
    overdueAlertsDesc: 'Warnung bei überfälligen Rechnungen',
    appearance: 'Darstellung',
    language: 'Sprache',
    theme: 'Farbschema',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
    integrations: 'Integrationen',
    datev: 'DATEV Export',
    datevDesc: 'Rechnungen automatisch zu DATEV exportieren',
    connected: 'Verbunden',
    notConnected: 'Nicht verbunden',
    connect: 'Verbinden',
    save: 'Speichern',
    saved: 'Gespeichert',
    users: 'Benutzer',
    addUser: 'Benutzer hinzufügen',
    admin: 'Administrator',
    editor: 'Bearbeiter',
    viewer: 'Betrachter',
  },
  en: {
    title: 'Settings',
    subtitle: 'Configure system settings and preferences',
    general: 'General',
    company: 'Company Data',
    companyName: 'Company Name',
    address: 'Address',
    taxId: 'Tax ID',
    email: 'Email',
    phone: 'Phone',
    defaults: 'Defaults',
    defaultMargin: 'Default Margin',
    defaultCurrency: 'Currency',
    defaultVat: 'VAT Rate',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive notifications for important events',
    weeklyReport: 'Weekly Report',
    weeklyReportDesc: 'Automatic summary report every Monday',
    overdueAlerts: 'Overdue Alerts',
    overdueAlertsDesc: 'Alert for overdue invoices',
    appearance: 'Appearance',
    language: 'Language',
    theme: 'Color Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    integrations: 'Integrations',
    datev: 'DATEV Export',
    datevDesc: 'Automatically export invoices to DATEV',
    connected: 'Connected',
    notConnected: 'Not Connected',
    connect: 'Connect',
    save: 'Save',
    saved: 'Saved',
    users: 'Users',
    addUser: 'Add User',
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  }
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar: string
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Johannes Decker', email: 'j.decker@mueller-bau.de', role: 'admin', avatar: 'JD' },
  { id: '2', name: 'Maria Schmidt', email: 'm.schmidt@mueller-bau.de', role: 'editor', avatar: 'MS' },
  { id: '3', name: 'Thomas Müller', email: 't.mueller@mueller-bau.de', role: 'viewer', avatar: 'TM' },
]

export default function SettingsPage() {
  const [lang, setLang] = useState<Language>('de')
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'users' | 'integrations'>('general')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(true)
  const [overdueAlerts, setOverdueAlerts] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const t = TRANSLATIONS[lang]

  const tabs = [
    { key: 'general', label: t.general },
    { key: 'notifications', label: t.notifications },
    { key: 'users', label: t.users },
    { key: 'integrations', label: t.integrations },
  ]

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'admin': return t.admin
      case 'editor': return t.editor
      case 'viewer': return t.viewer
    }
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'editor': return 'bg-blue-100 text-blue-700'
      case 'viewer': return 'bg-slate-100 text-slate-600'
    }
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
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Link href="/demo/dashboard" className="text-xs text-blue-600 font-bold hover:underline mb-2 block">← {lang === 'de' ? 'Zurück zum Dashboard' : 'Back to Dashboard'}</Link>
            <h1 className="text-4xl font-black text-slate-900 brand-font italic">{t.title}</h1>
            <p className="text-slate-500 mt-1">{t.subtitle}</p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <div className="w-48 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-grow">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  {/* Company Data */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.company}</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.companyName}</label>
                        <input type="text" defaultValue="Müller Bau GmbH" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.taxId}</label>
                        <input type="text" defaultValue="DE123456789" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.address}</label>
                        <input type="text" defaultValue="Musterstraße 12, 80331 München" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.email}</label>
                        <input type="email" defaultValue="info@mueller-bau.de" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.phone}</label>
                        <input type="tel" defaultValue="+49 89 123456" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Defaults */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.defaults}</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.defaultMargin}</label>
                        <input type="text" defaultValue="18%" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.defaultCurrency}</label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm">
                          <option>EUR (€)</option>
                          <option>CHF (Fr.)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.defaultVat}</label>
                        <input type="text" defaultValue="19%" className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.appearance}</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.language}</label>
                        <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm">
                          <option>Deutsch</option>
                          <option>English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t.theme}</label>
                        <div className="flex space-x-2">
                          {[
                            { key: 'light', label: t.themeLight },
                            { key: 'dark', label: t.themeDark },
                            { key: 'system', label: t.themeSystem },
                          ].map(th => (
                            <button
                              key={th.key}
                              onClick={() => setTheme(th.key as typeof theme)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === th.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                            >
                              {th.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700">
                    {t.save}
                  </button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t.notifications}</h3>

                  {[
                    { key: 'email', label: t.emailNotifications, desc: t.emailNotificationsDesc, state: emailNotifications, setState: setEmailNotifications },
                    { key: 'weekly', label: t.weeklyReport, desc: t.weeklyReportDesc, state: weeklyReport, setState: setWeeklyReport },
                    { key: 'overdue', label: t.overdueAlerts, desc: t.overdueAlertsDesc, state: overdueAlerts, setState: setOverdueAlerts },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.setState(!item.state)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${item.state ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${item.state ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t.users}</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      <span>{t.addUser}</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {MOCK_USERS.map((user, idx) => (
                      <div key={user.id} className={`p-4 flex items-center justify-between ${idx !== MOCK_USERS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">{t.integrations}</h3>

                  <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-700 font-black text-sm">DTV</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{t.datev}</p>
                        <p className="text-sm text-slate-500">{t.datevDesc}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{t.connected}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-black text-sm">API</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">REST API</p>
                        <p className="text-sm text-slate-500">{lang === 'de' ? 'Externe Systeme anbinden' : 'Connect external systems'}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">
                      {t.connect}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
