
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProjectDetail } from './pages/ProjectDetail';
import { SettingsPage } from './pages/SettingsPage';
import { PriceLibraryPage } from './pages/PriceLibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeamPage } from './pages/TeamPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SupportPage } from './pages/SupportPage';
import { TenderFeedPage } from './pages/TenderFeedPage';
import { MaterialCatalogPage } from './pages/MaterialCatalogPage';
import { ArchivePage } from './pages/ArchivePage';
import { ReportingPage } from './pages/ReportingPage';
import { CalculationsPage } from './pages/CalculationsPage';
import { InboxPage } from './pages/InboxPage';
import { ExamplesPage } from './pages/ExamplesPage';
import { Language } from './types';

/**
 * Enhanced navigation helper to strictly prevent session-killing redirects.
 */
export const navigateTo = (hash: string, e?: React.MouseEvent | React.FormEvent) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
    if ('stopImmediatePropagation' in e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
  }
  window.location.hash = hash;
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('de');
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  const handleHashChange = useCallback(() => {
    let hash = window.location.hash || '#/';
    if (hash.length > 2 && hash.endsWith('/')) {
      hash = hash.slice(0, -1);
    }
    setCurrentHash(hash);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  const renderContent = () => {
    if (currentHash === '#/beispiele') {
      return (
        <Layout lang={lang} setLang={setLang} showNav={false}>
          <ExamplesPage lang={lang} />
        </Layout>
      );
    }

    if (currentHash === '#/' || currentHash === '' || currentHash === '#') {
      return (
        <Layout lang={lang} setLang={setLang} showNav={false}>
          <LandingPage lang={lang} />
        </Layout>
      );
    }

    const pages: Record<string, React.ReactNode> = {
      '#/dashboard': <Dashboard lang={lang} />,
      '#/settings': <SettingsPage lang={lang} />,
      '#/price-library': <PriceLibraryPage lang={lang} />,
      '#/analytics': <AnalyticsPage lang={lang} />,
      '#/team': <TeamPage lang={lang} />,
      '#/knowledge': <KnowledgePage lang={lang} />,
      '#/audit': <AuditLogPage lang={lang} />,
      '#/support': <SupportPage lang={lang} />,
      '#/tenders': <TenderFeedPage lang={lang} />,
      '#/materials': <MaterialCatalogPage lang={lang} />,
      '#/archive': <ArchivePage lang={lang} />,
      '#/reporting': <ReportingPage lang={lang} />,
      '#/calculations': <CalculationsPage lang={lang} />,
      '#/inbox': <InboxPage lang={lang} />,
    };

    if (pages[currentHash]) {
      return (
        <Layout lang={lang} setLang={setLang} showNav={true}>
          {pages[currentHash]}
        </Layout>
      );
    }

    if (currentHash.startsWith('#/project/')) {
      const projectId = currentHash.split('/').pop() || '';
      return (
        <Layout lang={lang} setLang={setLang} showNav={true}>
          <ProjectDetail lang={lang} projectId={projectId} />
        </Layout>
      );
    }

    return (
      <Layout lang={lang} setLang={setLang}>
        <div className="p-20 text-center italic font-bold text-slate-300">
          <h1 className="text-4xl brand-font uppercase tracking-tighter">404 - Seite nicht gefunden</h1>
          <button 
            onClick={(e) => navigateTo('#/', e)} 
            className="text-blue-600 underline mt-6 inline-block font-black uppercase tracking-widest text-xs"
          >
            Zurück zum Start
          </button>
        </div>
      </Layout>
    );
  };

  return renderContent();
};

export default App;
