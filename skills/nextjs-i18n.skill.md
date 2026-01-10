# Next.js App Router with Internationalization (i18n)

## Overview
This skill covers building multilingual Next.js applications using the App Router with `next-intl` for internationalization. Essential for applications requiring German/English language support with clean URL routing.

## When to Use
- Building multilingual web applications
- Projects requiring locale-based routing (`/de/...`, `/en/...`)
- Applications with translatable UI strings and content
- Construction/business apps targeting DACH region (German-speaking markets)

## Technology Stack
- **Framework**: Next.js 14+ with App Router
- **i18n Library**: `next-intl` (recommended over `next-i18next` for App Router)
- **TypeScript**: Strongly typed translations
- **Tailwind CSS**: For styling (optional but recommended)

## Project Structure

```
├── app/
│   └── [locale]/
│       ├── layout.tsx          # Root layout with IntlProvider
│       ├── page.tsx            # Home page
│       ├── dashboard/
│       │   └── page.tsx
│       └── projects/
│           ├── page.tsx
│           └── [id]/
│               └── page.tsx
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── LanguageSwitcher.tsx    # Locale toggle component
│   └── Navigation.tsx
├── messages/
│   ├── de.json                 # German translations
│   └── en.json                 # English translations
├── i18n/
│   ├── config.ts               # i18n configuration
│   ├── request.ts              # Server-side locale handling
│   └── navigation.ts           # Typed navigation helpers
├── middleware.ts               # Locale detection & routing
└── next.config.js
```

## Installation

```bash
npm install next-intl
```

## Core Implementation

### 1. i18n Configuration (`i18n/config.ts`)

```typescript
export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
};

// For date/number formatting
export const localeFormats: Record<Locale, { dateStyle: string; currency: string }> = {
  de: { dateStyle: 'de-DE', currency: 'EUR' },
  en: { dateStyle: 'en-GB', currency: 'EUR' },
};
```

### 2. Request Configuration (`i18n/request.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    return { messages: {} };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Berlin',
    now: new Date(),
  };
});
```

### 3. Middleware (`middleware.ts`)

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // or 'as-needed' for cleaner URLs
});

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: ['/', '/(de|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 4. Root Layout (`app/[locale]/layout.tsx`)

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: Props) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 5. Navigation Helpers (`i18n/navigation.ts`)

```typescript
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { locales } from './config';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales });
```

### 6. Translation Files Structure

**`messages/de.json`**:
```json
{
  "metadata": {
    "title": "AngebotsAgent - Angebote schneller erstellen",
    "description": "Automatisierte Angebotserstellung für Subunternehmer im Bauwesen"
  },
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "loading": "Wird geladen...",
    "error": "Ein Fehler ist aufgetreten",
    "success": "Erfolgreich gespeichert"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "projects": "Projekte",
    "settings": "Einstellungen",
    "priceLibrary": "Preisbibliothek",
    "logout": "Abmelden"
  },
  "projects": {
    "title": "Meine Projekte",
    "newProject": "Neues Projekt",
    "client": "Auftraggeber",
    "dueDate": "Abgabefrist",
    "status": {
      "draft": "Entwurf",
      "inProgress": "In Bearbeitung",
      "submitted": "Eingereicht"
    }
  },
  "offer": {
    "title": "Angebot",
    "lineItems": "Positionen",
    "position": "Pos.",
    "description": "Beschreibung",
    "unit": "Einheit",
    "quantity": "Menge",
    "unitPrice": "EP (€)",
    "total": "Gesamt (€)",
    "subtotal": "Zwischensumme",
    "vat": "MwSt. ({rate}%)",
    "grandTotal": "Gesamtsumme"
  },
  "extraction": {
    "status": {
      "uploaded": "Hochgeladen",
      "parsing": "Wird analysiert",
      "extracted": "Extrahiert",
      "failed": "Fehlgeschlagen"
    },
    "notFound": "Nicht gefunden - manuelle Eingabe erforderlich",
    "confidence": "Konfidenz: {level}"
  },
  "risks": {
    "title": "Nachtragspotenziale",
    "quantityMismatch": "Mengenabweichung",
    "missingDetail": "Fehlende Angabe",
    "conflictingDocs": "Widersprüchliche Dokumente"
  }
}
```

**`messages/en.json`**:
```json
{
  "metadata": {
    "title": "AngebotsAgent - Create Offers Faster",
    "description": "Automated offer creation for construction subcontractors"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Successfully saved"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "projects": "Projects",
    "settings": "Settings",
    "priceLibrary": "Price Library",
    "logout": "Log out"
  },
  "projects": {
    "title": "My Projects",
    "newProject": "New Project",
    "client": "Client",
    "dueDate": "Due Date",
    "status": {
      "draft": "Draft",
      "inProgress": "In Progress",
      "submitted": "Submitted"
    }
  },
  "offer": {
    "title": "Offer",
    "lineItems": "Line Items",
    "position": "Pos.",
    "description": "Description",
    "unit": "Unit",
    "quantity": "Quantity",
    "unitPrice": "Unit Price (€)",
    "total": "Total (€)",
    "subtotal": "Subtotal",
    "vat": "VAT ({rate}%)",
    "grandTotal": "Grand Total"
  },
  "extraction": {
    "status": {
      "uploaded": "Uploaded",
      "parsing": "Parsing",
      "extracted": "Extracted",
      "failed": "Failed"
    },
    "notFound": "Not found - manual input required",
    "confidence": "Confidence: {level}"
  },
  "risks": {
    "title": "Potential Change Orders",
    "quantityMismatch": "Quantity Mismatch",
    "missingDetail": "Missing Detail",
    "conflictingDocs": "Conflicting Documents"
  }
}
```

### 7. Language Switcher Component

```typescript
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            locale === loc
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
```

### 8. Using Translations in Components

**Server Component:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function ProjectsPage() {
  const t = await getTranslations('projects');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('newProject')}</button>
    </div>
  );
}
```

**Client Component:**
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ProjectCard({ project }) {
  const t = useTranslations('projects');

  return (
    <div>
      <p>{t('client')}: {project.clientName}</p>
      <p>{t('status.' + project.status)}</p>
    </div>
  );
}
```

**With Interpolation:**
```typescript
// Translation: "vat": "VAT ({rate}%)"
t('offer.vat', { rate: 19 }) // → "VAT (19%)"
```

### 9. Formatting Numbers and Dates

```typescript
import { useFormatter } from 'next-intl';

export function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter();

  return (
    <span>
      {format.number(amount, {
        style: 'currency',
        currency: 'EUR',
      })}
    </span>
  );
}

export function DateDisplay({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <span>
      {format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </span>
  );
}
```

## Best Practices

1. **Namespace Organization**: Group translations by feature/page for maintainability
2. **Type Safety**: Use TypeScript for typed translation keys
3. **Fallbacks**: Always provide fallback text for missing translations
4. **SEO**: Use `generateMetadata` for localized meta tags
5. **URL Structure**: Use `/de/...` and `/en/...` patterns for SEO
6. **Lazy Loading**: Load translation files per-locale to reduce bundle size

## Common Patterns for Construction Apps

### Trade-Specific Terminology
```json
{
  "trades": {
    "drywall": "Trockenbau",
    "screed": "Estrich",
    "waterproofing": "Abdichtung",
    "flooring": "Bodenbelag"
  },
  "units": {
    "sqm": "m²",
    "lm": "lfm",
    "pcs": "Stk.",
    "hours": "Std."
  }
}
```

### Document Status Labels
```json
{
  "documents": {
    "tender": "Ausschreibung",
    "specs": "Leistungsverzeichnis",
    "plans": "Pläne",
    "offer": "Angebot"
  }
}
```

## Testing i18n

```typescript
// __tests__/i18n.test.tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/de.json';

function renderWithIntl(component: React.ReactNode, locale = 'de') {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
}
```

## Checklist

- [ ] Install `next-intl`
- [ ] Create `messages/de.json` and `messages/en.json`
- [ ] Set up middleware for locale routing
- [ ] Configure root layout with `NextIntlClientProvider`
- [ ] Create typed navigation helpers
- [ ] Implement `LanguageSwitcher` component
- [ ] Add locale-specific metadata
- [ ] Test both language versions
