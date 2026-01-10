# AngebotsAgent Skills Reference

This directory contains Claude skill documentation for building the AngebotsAgent application - a web app for German construction subcontractors to create offers faster.

## Available Skills

### Core Extraction & Processing

| Skill | Description | File |
|-------|-------------|------|
| **Area Extraction** | Deterministic room area extraction from CAD PDFs with 100% traceability | [area-extraction.skill.md](./area-extraction.skill.md) |
| **Change Order Detection** | Identify Nachtragspotenziale (potential change orders) from quantity mismatches and scope gaps | [change-order-detection.skill.md](./change-order-detection.skill.md) |

### Pricing & Offers

| Skill | Description | File |
|-------|-------------|------|
| **Competitive Pricing** | Price library management and competitive pricing strategies for German construction | [competitive-pricing.skill.md](./competitive-pricing.skill.md) |
| **Offer Draft Generation** | Generate professional construction offers with line items, markups, and risk factors | [offer-draft-generation.skill.md](./offer-draft-generation.skill.md) |

### Export & Output

| Skill | Description | File |
|-------|-------------|------|
| **XLSX Export** | Generate professional Excel spreadsheets with German formatting, formulas, and styling | [xlsx-export.skill.md](./xlsx-export.skill.md) |

### Infrastructure

| Skill | Description | File |
|-------|-------------|------|
| **Supabase Integration** | Auth, database, storage, and RLS for multi-tenant SaaS | [supabase-integration.skill.md](./supabase-integration.skill.md) |
| **Next.js i18n** | Internationalization setup with next-intl (German-first) | [nextjs-i18n.skill.md](./nextjs-i18n.skill.md) |

## Skill Structure

Each skill file follows this structure:

```markdown
# Skill Title

## Overview
Brief description of what the skill covers

## When to Use
- Use case 1
- Use case 2

## Technology Stack
Libraries and frameworks used

## Project Structure
Recommended file organization

## Core Implementation
Step-by-step implementation guide with code examples

## API Reference
Endpoint specifications and data models

## Testing
How to verify the implementation

## Common Patterns
Reusable patterns and best practices
```

## Target Gewerke (Trades)

The AngebotsAgent MVP focuses on these German construction trades:

| Gewerk | German | Key Measurements |
|--------|--------|------------------|
| **Trockenbau** | Drywall | m² walls, m² ceilings, m linear |
| **Estrich** | Screed | m² floor area, m³ volume |
| **Abdichtung** | Waterproofing | m² surface, m linear seams |
| **Bodenleger** | Flooring | m² floor area, m linear baseboards |

## German Construction Standards

These skills are designed for compliance with:

- **VOB/B** - Vergabe- und Vertragsordnung für Bauleistungen
- **DIN 277** - Grundflächen und Rauminhalte im Hochbau
- **GAEB** - Gemeinsamer Ausschuss Elektronik im Bauwesen (data exchange)
- **StLB-Bau** - Standardleistungsbuch für das Bauwesen

## Quick Start

1. **New Project Setup**: Start with [supabase-integration.skill.md](./supabase-integration.skill.md) and [nextjs-i18n.skill.md](./nextjs-i18n.skill.md)

2. **Document Processing**: Implement [area-extraction.skill.md](./area-extraction.skill.md) for PDF parsing

3. **Pricing & Offers**: Add [competitive-pricing.skill.md](./competitive-pricing.skill.md) and [offer-draft-generation.skill.md](./offer-draft-generation.skill.md)

4. **Risk Analysis**: Integrate [change-order-detection.skill.md](./change-order-detection.skill.md)

5. **Export**: Implement [xlsx-export.skill.md](./xlsx-export.skill.md) for final deliverables

## Usage with Claude

Reference these skills when working with Claude Code:

```
Please help me implement the area extraction feature following the
guidance in skills/area-extraction.skill.md
```

Or reference specific sections:

```
Using the patterns from skills/xlsx-export.skill.md, create an
Excel export for the offer line items with German number formatting.
```
