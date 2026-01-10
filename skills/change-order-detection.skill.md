# Change Order Detection (Nachtragspotenziale)

## Overview
This skill covers detecting potential change orders (Nachtragspotenziale) by analyzing tender documents for inconsistencies, missing details, scope gaps, and contradictions. The goal is early visibility for better pricing decisions and fewer surprises during construction—not legal claims.

## When to Use
- Analyzing tender packages before submitting offers
- Comparing specifications against plan data
- Identifying scope gaps by trade
- Generating clarification questions for main contractors
- Building risk-adjusted pricing strategies
- Creating audit trails for detected issues

## Core Principles

### What We Detect (Flags)
| Category | German Term | Examples |
|----------|-------------|----------|
| **Quantity Mismatch** | Mengenabweichung | Spec says 500m², plan measures 620m² |
| **Missing Detail** | Fehlende Angabe | No edge detail specified, layer thickness unclear |
| **Conflicting Documents** | Widersprüchliche Unterlagen | Plan shows single layer, spec says double |
| **Scope Gap** | Leistungslücke | Transitions between trades undefined |
| **Ambiguous Specification** | Unklare Angabe | "Appropriate waterproofing" without specifics |
| **Unrealistic Timeline** | Unrealistischer Zeitplan | 2 weeks for 2000m² screed in winter |

### What We Do NOT Do
- ❌ Make legal determinations
- ❌ Guarantee completeness of detection
- ❌ Replace professional judgment
- ❌ Claim extraction is 100% accurate

### Output Requirements
Every flag MUST include:
1. **Reason**: Clear explanation of the issue
2. **Source Reference**: Document + page + excerpt
3. **Severity**: Low / Medium / High
4. **Clarification Question**: Concrete question for the GC
5. **Price Impact Indicator**: Potential cost direction

## Project Structure

```
├── lib/
│   └── change-orders/
│       ├── detector.ts              # Main detection engine
│       ├── rules/
│       │   ├── index.ts
│       │   ├── quantity-rules.ts    # Quantity comparison rules
│       │   ├── detail-rules.ts      # Missing detail rules
│       │   ├── conflict-rules.ts    # Document conflict rules
│       │   └── trade-specific/
│       │       ├── drywall.ts
│       │       ├── screed.ts
│       │       ├── waterproofing.ts
│       │       └── flooring.ts
│       ├── types.ts                 # Type definitions
│       ├── question-generator.ts    # Generates clarification Qs
│       └── risk-scorer.ts           # Calculates risk scores
├── services/
│   └── pdf-service/
│       └── extractors/
│           └── change-order-extractor.py
```

## Type Definitions (`lib/change-orders/types.ts`)

```typescript
export type FlagType = 
  | 'quantity_mismatch'
  | 'missing_detail'
  | 'conflicting_docs'
  | 'scope_gap'
  | 'ambiguous_spec'
  | 'unrealistic_timeline';

export type Severity = 'low' | 'medium' | 'high';

export type Trade = 'drywall' | 'screed' | 'waterproofing' | 'flooring' | 'general';

export type PriceImpact = 'increase' | 'decrease' | 'uncertain' | 'none';

export interface SourceReference {
  documentId: string;
  documentName: string;
  pageNumber: number;
  excerpt: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface RiskFlag {
  id: string;
  type: FlagType;
  trade: Trade;
  severity: Severity;
  title: string;
  description: string;
  reason: string;
  sources: SourceReference[];
  clarificationQuestion: string;
  clarificationQuestionEn?: string;
  priceImpact: PriceImpact;
  estimatedImpactPercent?: number; // e.g., 5 means +5% cost risk
  detectionMethod: 'rule' | 'comparison' | 'llm' | 'manual';
  confidence: number; // 0.0 to 1.0
  resolved: boolean;
  resolutionNotes?: string;
  createdAt: Date;
}

export interface DetectionContext {
  projectId: string;
  trade: Trade;
  extractedData: ExtractedData;
  takeoffResults: TakeoffResult[];
  documents: DocumentInfo[];
}

export interface ExtractedData {
  tenderSummary: TenderSummary;
  statedQuantities: QuantityItem[];
  specifications: SpecificationItem[];
  scheduleInfo: ScheduleInfo;
}

export interface QuantityItem {
  description: string;
  value: number;
  unit: string;
  source: SourceReference;
}

export interface TakeoffResult {
  label: string;
  value: number;
  unit: string;
  measurementType: 'extracted' | 'measured';
  source: SourceReference;
}

export interface ComparisonResult {
  statedQuantity: QuantityItem;
  measuredQuantity: TakeoffResult;
  difference: number;
  differencePercent: number;
  significant: boolean;
}
```

## Detection Engine (`lib/change-orders/detector.ts`)

```typescript
import { v4 as uuidv4 } from 'uuid';
import {
  RiskFlag,
  DetectionContext,
  FlagType,
  Severity,
  Trade,
  ComparisonResult,
} from './types';
import { quantityRules } from './rules/quantity-rules';
import { detailRules } from './rules/detail-rules';
import { conflictRules } from './rules/conflict-rules';
import { getTradeRules } from './rules/trade-specific';
import { generateClarificationQuestion } from './question-generator';
import { calculateRiskScore } from './risk-scorer';

export class ChangeOrderDetector {
  private context: DetectionContext;
  private flags: RiskFlag[] = [];

  constructor(context: DetectionContext) {
    this.context = context;
  }

  async detectAll(): Promise<RiskFlag[]> {
    this.flags = [];

    // 1. Quantity comparisons
    await this.detectQuantityMismatches();

    // 2. Missing details (trade-specific)
    await this.detectMissingDetails();

    // 3. Document conflicts
    await this.detectConflicts();

    // 4. Trade-specific rules
    await this.applyTradeSpecificRules();

    // 5. Timeline analysis
    await this.detectTimelineIssues();

    // Calculate final risk scores
    this.flags = this.flags.map(flag => ({
      ...flag,
      ...calculateRiskScore(flag, this.context),
    }));

    return this.flags;
  }

  private async detectQuantityMismatches(): Promise<void> {
    const comparisons = this.compareQuantities();

    for (const comparison of comparisons) {
      if (!comparison.significant) continue;

      const flag = this.createFlag({
        type: 'quantity_mismatch',
        severity: this.getQuantitySeverity(comparison.differencePercent),
        title: `Mengenabweichung: ${comparison.statedQuantity.description}`,
        description: this.formatQuantityDescription(comparison),
        reason: `Die im LV angegebene Menge (${comparison.statedQuantity.value} ${comparison.statedQuantity.unit}) ` +
                `weicht von der ermittelten Menge (${comparison.measuredQuantity.value} ${comparison.measuredQuantity.unit}) ` +
                `um ${Math.abs(comparison.differencePercent).toFixed(1)}% ab.`,
        sources: [comparison.statedQuantity.source, comparison.measuredQuantity.source],
        priceImpact: comparison.difference > 0 ? 'increase' : 'decrease',
        estimatedImpactPercent: Math.abs(comparison.differencePercent),
      });

      this.flags.push(flag);
    }
  }

  private compareQuantities(): ComparisonResult[] {
    const results: ComparisonResult[] = [];
    const { statedQuantities } = this.context.extractedData;
    const { takeoffResults } = this.context;

    // Match stated quantities to takeoff results by description/label
    for (const stated of statedQuantities) {
      const matching = takeoffResults.find(takeoff =>
        this.isMatchingQuantity(stated.description, takeoff.label, stated.unit, takeoff.unit)
      );

      if (matching) {
        const difference = matching.value - stated.value;
        const differencePercent = (difference / stated.value) * 100;

        results.push({
          statedQuantity: stated,
          measuredQuantity: matching,
          difference,
          differencePercent,
          significant: Math.abs(differencePercent) > 5, // >5% is significant
        });
      }
    }

    return results;
  }

  private isMatchingQuantity(
    statedDesc: string,
    takeoffLabel: string,
    statedUnit: string,
    takeoffUnit: string
  ): boolean {
    // Normalize units
    const normalizedUnits: Record<string, string[]> = {
      'm²': ['m²', 'm2', 'qm', 'sqm'],
      'm': ['m', 'lfm', 'lm'],
      'Stk': ['Stk', 'Stk.', 'Stück', 'pcs'],
    };

    const unitsMatch = Object.values(normalizedUnits).some(
      group => group.includes(statedUnit) && group.includes(takeoffUnit)
    );

    if (!unitsMatch) return false;

    // Simple keyword matching (could be enhanced with embeddings)
    const statedWords = statedDesc.toLowerCase().split(/\s+/);
    const takeoffWords = takeoffLabel.toLowerCase().split(/\s+/);

    const commonWords = statedWords.filter(w => 
      takeoffWords.some(tw => tw.includes(w) || w.includes(tw))
    );

    return commonWords.length >= 2;
  }

  private async detectMissingDetails(): Promise<void> {
    const tradeRules = getTradeRules(this.context.trade);
    const specifications = this.context.extractedData.specifications;

    for (const rule of tradeRules.requiredDetails) {
      const found = specifications.some(spec =>
        rule.keywords.some(kw => spec.text.toLowerCase().includes(kw.toLowerCase()))
      );

      if (!found) {
        const flag = this.createFlag({
          type: 'missing_detail',
          severity: rule.severity,
          title: `Fehlende Angabe: ${rule.name}`,
          description: rule.description,
          reason: `Die Ausschreibungsunterlagen enthalten keine Angaben zu: ${rule.name}. ` +
                  `Dies ist für ${this.getTradeNameDE()} typischerweise erforderlich.`,
          sources: [], // No specific source for missing info
          priceImpact: 'uncertain',
          estimatedImpactPercent: rule.typicalImpactPercent,
        });

        this.flags.push(flag);
      }
    }
  }

  private async detectConflicts(): Promise<void> {
    // Cross-reference specifications against plan data
    const specs = this.context.extractedData.specifications;
    const takeoffs = this.context.takeoffResults;

    // Example: Check for layer count conflicts
    for (const spec of specs) {
      const layerMatch = spec.text.match(/(\d+)[- ]?lagig|(\d+)\s*Lagen?/i);
      if (layerMatch) {
        const specLayers = parseInt(layerMatch[1] || layerMatch[2]);

        // Look for conflicting info in takeoff notes
        for (const takeoff of takeoffs) {
          if (takeoff.source.excerpt) {
            const planLayerMatch = takeoff.source.excerpt.match(/(\d+)[- ]?lagig|(\d+)\s*Lagen?/i);
            if (planLayerMatch) {
              const planLayers = parseInt(planLayerMatch[1] || planLayerMatch[2]);

              if (specLayers !== planLayers) {
                const flag = this.createFlag({
                  type: 'conflicting_docs',
                  severity: 'high',
                  title: `Widerspruch: Lagenanzahl`,
                  description: `LV gibt ${specLayers}-lagig an, Plan zeigt ${planLayers}-lagig.`,
                  reason: `Die Ausschreibung (${spec.source.documentName}, S. ${spec.source.pageNumber}) ` +
                          `widerspricht dem Plan (${takeoff.source.documentName}, S. ${takeoff.source.pageNumber}).`,
                  sources: [spec.source, takeoff.source],
                  priceImpact: specLayers < planLayers ? 'increase' : 'decrease',
                  estimatedImpactPercent: Math.abs(planLayers - specLayers) * 15,
                });

                this.flags.push(flag);
              }
            }
          }
        }
      }
    }
  }

  private async applyTradeSpecificRules(): Promise<void> {
    const tradeRules = getTradeRules(this.context.trade);

    for (const rule of tradeRules.customRules) {
      const result = rule.check(this.context);
      if (result.triggered) {
        const flag = this.createFlag({
          type: result.type,
          severity: result.severity,
          title: result.title,
          description: result.description,
          reason: result.reason,
          sources: result.sources,
          priceImpact: result.priceImpact,
          estimatedImpactPercent: result.estimatedImpact,
        });

        this.flags.push(flag);
      }
    }
  }

  private async detectTimelineIssues(): Promise<void> {
    const schedule = this.context.extractedData.scheduleInfo;
    if (!schedule?.startDate || !schedule?.endDate) return;

    const durationDays = Math.ceil(
      (schedule.endDate.getTime() - schedule.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get total quantities for timeline estimation
    const totalArea = this.context.takeoffResults
      .filter(t => t.unit === 'm²')
      .reduce((sum, t) => sum + t.value, 0);

    // Trade-specific productivity rates (m²/day typical)
    const productivityRates: Record<Trade, number> = {
      drywall: 80,      // ~80 m²/day/team
      screed: 200,      // ~200 m²/day
      waterproofing: 50, // ~50 m²/day (detail work)
      flooring: 100,    // ~100 m²/day
      general: 100,
    };

    const expectedDays = totalArea / productivityRates[this.context.trade];
    
    if (durationDays < expectedDays * 0.6) {
      const flag = this.createFlag({
        type: 'unrealistic_timeline',
        severity: 'medium',
        title: `Knappe Zeitplanung`,
        description: `${durationDays} Tage für ${totalArea.toFixed(0)} m² erscheint ambitioniert.`,
        reason: `Bei üblicher Produktivität wären ca. ${Math.ceil(expectedDays)} Arbeitstage zu erwarten. ` +
                `Der Zeitplan sieht nur ${durationDays} Tage vor, was Mehrkosten verursachen kann.`,
        sources: schedule.source ? [schedule.source] : [],
        priceImpact: 'increase',
        estimatedImpactPercent: 10,
      });

      this.flags.push(flag);
    }
  }

  private createFlag(params: Partial<RiskFlag> & {
    type: FlagType;
    severity: Severity;
    title: string;
    description: string;
    reason: string;
    sources: SourceReference[];
    priceImpact: PriceImpact;
  }): RiskFlag {
    const question = generateClarificationQuestion(params, this.context.trade);

    return {
      id: uuidv4(),
      type: params.type,
      trade: this.context.trade,
      severity: params.severity,
      title: params.title,
      description: params.description,
      reason: params.reason,
      sources: params.sources,
      clarificationQuestion: question.de,
      clarificationQuestionEn: question.en,
      priceImpact: params.priceImpact,
      estimatedImpactPercent: params.estimatedImpactPercent,
      detectionMethod: 'rule',
      confidence: params.sources.length > 0 ? 0.8 : 0.6,
      resolved: false,
      createdAt: new Date(),
    };
  }

  private getQuantitySeverity(differencePercent: number): Severity {
    const abs = Math.abs(differencePercent);
    if (abs > 20) return 'high';
    if (abs > 10) return 'medium';
    return 'low';
  }

  private formatQuantityDescription(comparison: ComparisonResult): string {
    const { statedQuantity, measuredQuantity, differencePercent } = comparison;
    const direction = differencePercent > 0 ? 'mehr' : 'weniger';
    return `LV: ${statedQuantity.value} ${statedQuantity.unit} | ` +
           `Ermittelt: ${measuredQuantity.value} ${measuredQuantity.unit} | ` +
           `${Math.abs(differencePercent).toFixed(1)}% ${direction}`;
  }

  private getTradeNameDE(): string {
    const names: Record<Trade, string> = {
      drywall: 'Trockenbauarbeiten',
      screed: 'Estricharbeiten',
      waterproofing: 'Abdichtungsarbeiten',
      flooring: 'Bodenbelagsarbeiten',
      general: 'Bauleistungen',
    };
    return names[this.context.trade];
  }
}
```

## Trade-Specific Rules (`lib/change-orders/rules/trade-specific/drywall.ts`)

```typescript
import { Trade, Severity, DetectionContext, SourceReference, FlagType, PriceImpact } from '../../types';

interface RequiredDetail {
  name: string;
  keywords: string[];
  description: string;
  severity: Severity;
  typicalImpactPercent: number;
}

interface CustomRule {
  id: string;
  name: string;
  check: (context: DetectionContext) => RuleResult;
}

interface RuleResult {
  triggered: boolean;
  type: FlagType;
  severity: Severity;
  title: string;
  description: string;
  reason: string;
  sources: SourceReference[];
  priceImpact: PriceImpact;
  estimatedImpact: number;
}

export const drywallRules = {
  requiredDetails: [
    {
      name: 'Beplankungsart',
      keywords: ['GKB', 'GKF', 'GKFI', 'Gipskarton', 'Gipsfaser', 'Fermacell'],
      description: 'Plattentyp (Standard, Feuchtraum, Brandschutz) nicht spezifiziert',
      severity: 'medium' as Severity,
      typicalImpactPercent: 8,
    },
    {
      name: 'Plattendicke',
      keywords: ['12,5mm', '15mm', '18mm', '25mm', 'Plattendicke', 'Plattenstärke'],
      description: 'Dicke der Gipsplatten nicht angegeben',
      severity: 'medium' as Severity,
      typicalImpactPercent: 5,
    },
    {
      name: 'Ständerwerk',
      keywords: ['CW', 'UW', 'Ständer', 'Profil', 'Achsabstand', 'c/c'],
      description: 'Ständerprofile und Achsabstände nicht definiert',
      severity: 'high' as Severity,
      typicalImpactPercent: 12,
    },
    {
      name: 'Dämmung',
      keywords: ['Mineralwolle', 'Dämmung', 'Schallschutz', 'WLG', 'mm Dämmstoff'],
      description: 'Dämmstoffart und -dicke nicht spezifiziert',
      severity: 'medium' as Severity,
      typicalImpactPercent: 10,
    },
    {
      name: 'Fugenausbildung',
      keywords: ['Q1', 'Q2', 'Q3', 'Q4', 'Qualitätsstufe', 'Spachtelung', 'Oberfläche'],
      description: 'Oberflächenqualität (Q1-Q4) nicht angegeben',
      severity: 'high' as Severity,
      typicalImpactPercent: 15,
    },
    {
      name: 'Anschlussdetails',
      keywords: ['Anschluss', 'Leibung', 'Sturz', 'Sockel', 'Deckenanschluss'],
      description: 'Anschlussausbildungen an Boden, Decke, Wand nicht definiert',
      severity: 'medium' as Severity,
      typicalImpactPercent: 8,
    },
    {
      name: 'Brandschutzklasse',
      keywords: ['F30', 'F60', 'F90', 'F120', 'EI30', 'EI60', 'EI90', 'Brandschutz'],
      description: 'Brandschutzanforderungen nicht spezifiziert',
      severity: 'high' as Severity,
      typicalImpactPercent: 20,
    },
    {
      name: 'Schallschutzwerte',
      keywords: ['dB', 'Rw', 'Schallschutz', 'Schalldämm'],
      description: 'Schallschutzanforderungen nicht angegeben',
      severity: 'medium' as Severity,
      typicalImpactPercent: 10,
    },
  ] as RequiredDetail[],

  customRules: [
    {
      id: 'drywall_height_check',
      name: 'Raumhöhen-Check',
      check: (context: DetectionContext): RuleResult => {
        // Check for room heights > 3.0m requiring special construction
        const heightPattern = /(\d+[.,]\d+)\s*m\s*(Raum)?höhe|Höhe[:\s]+(\d+[.,]\d+)/gi;
        let maxHeight = 0;
        let heightSource: SourceReference | null = null;

        for (const spec of context.extractedData.specifications) {
          const matches = spec.text.matchAll(heightPattern);
          for (const match of matches) {
            const height = parseFloat((match[1] || match[3]).replace(',', '.'));
            if (height > maxHeight) {
              maxHeight = height;
              heightSource = spec.source;
            }
          }
        }

        if (maxHeight > 3.0) {
          return {
            triggered: true,
            type: 'scope_gap',
            severity: maxHeight > 4.0 ? 'high' : 'medium',
            title: `Überhöhe: ${maxHeight.toFixed(2)}m Raumhöhe`,
            description: `Raumhöhen über 3,0m erfordern verstärkte Unterkonstruktion.`,
            reason: `Bei ${maxHeight.toFixed(2)}m Raumhöhe sind Sondermaßnahmen wie verstärkte Profile, ` +
                    `zusätzliche Aussteifungen oder doppelte CW-Profile erforderlich. ` +
                    `Dies ist im LV möglicherweise nicht berücksichtigt.`,
            sources: heightSource ? [heightSource] : [],
            priceImpact: 'increase',
            estimatedImpact: maxHeight > 4.0 ? 25 : 15,
          };
        }

        return { triggered: false } as RuleResult;
      },
    },
    {
      id: 'drywall_curved_walls',
      name: 'Gebogene Wände',
      check: (context: DetectionContext): RuleResult => {
        const curvedKeywords = ['gebogen', 'Radius', 'rund', 'curved', 'Bogen'];
        
        for (const spec of context.extractedData.specifications) {
          if (curvedKeywords.some(kw => spec.text.toLowerCase().includes(kw.toLowerCase()))) {
            return {
              triggered: true,
              type: 'scope_gap',
              severity: 'high',
              title: 'Gebogene Trockenbaukonstruktion',
              description: 'Gebogene Wände erfordern Spezialverfahren und höheren Aufwand.',
              reason: 'Gebogene Trockenbauwände benötigen spezielle Biegeverfahren, ' +
                      'flexible Platten oder vorgebogene Profile. Der Mehraufwand ist erheblich.',
              sources: [spec.source],
              priceImpact: 'increase',
              estimatedImpact: 40,
            };
          }
        }

        return { triggered: false } as RuleResult;
      },
    },
    {
      id: 'drywall_installation_check',
      name: 'Installationsführung',
      check: (context: DetectionContext): RuleResult => {
        // Check if installation routing is mentioned
        const hasInstallations = context.extractedData.specifications.some(spec =>
          /Elektro|Installation|Leerrohr|Steckdose|Schalter/i.test(spec.text)
        );

        const hasInstallationDetail = context.extractedData.specifications.some(spec =>
          /Installationsebene|Vorsatzschale|doppelt beplankt.*Installation/i.test(spec.text)
        );

        if (hasInstallations && !hasInstallationDetail) {
          return {
            triggered: true,
            type: 'missing_detail',
            severity: 'medium',
            title: 'Installationsführung unklar',
            description: 'Elektroinstallationen erwähnt, aber Ausführungsart nicht definiert.',
            reason: 'Es werden Installationen erwähnt, aber nicht ob diese in der Ständerebene, ' +
                    'einer Vorsatzschale oder über Aufputz-Kanäle geführt werden sollen.',
            sources: [],
            priceImpact: 'uncertain',
            estimatedImpact: 8,
          };
        }

        return { triggered: false } as RuleResult;
      },
    },
  ] as CustomRule[],
};

// Similar files for screed.ts, waterproofing.ts, flooring.ts
```

## Question Generator (`lib/change-orders/question-generator.ts`)

```typescript
import { FlagType, Trade, RiskFlag } from './types';

interface QuestionTemplate {
  de: string;
  en: string;
}

const questionTemplates: Record<FlagType, QuestionTemplate[]> = {
  quantity_mismatch: [
    {
      de: 'Bitte um Klärung der Mengenangabe für {item}. Die Ausschreibung nennt {stated}, unsere Ermittlung ergibt {measured}. Welche Menge ist für die Kalkulation verbindlich?',
      en: 'Please clarify the quantity for {item}. The tender states {stated}, our calculation shows {measured}. Which quantity should be used for pricing?',
    },
  ],
  missing_detail: [
    {
      de: 'Die Ausschreibung enthält keine Angaben zu {detail}. Bitte um Mitteilung der gewünschten Ausführung für unsere Kalkulation.',
      en: 'The tender documents do not specify {detail}. Please advise on the required specification for our pricing.',
    },
  ],
  conflicting_docs: [
    {
      de: 'Wir haben einen Widerspruch zwischen {doc1} und {doc2} bezüglich {topic} festgestellt. Bitte um Klärung welche Angabe maßgeblich ist.',
      en: 'We found a discrepancy between {doc1} and {doc2} regarding {topic}. Please clarify which specification takes precedence.',
    },
  ],
  scope_gap: [
    {
      de: 'Die Leistungsabgrenzung für {scope} ist nicht eindeutig definiert. Bitte um Bestätigung ob diese Leistung im Angebot enthalten sein soll.',
      en: 'The scope boundary for {scope} is not clearly defined. Please confirm whether this work should be included in our offer.',
    },
  ],
  ambiguous_spec: [
    {
      de: 'Die Angabe "{spec}" ist für unsere Kalkulation nicht ausreichend konkret. Bitte um Präzisierung.',
      en: 'The specification "{spec}" is not sufficiently detailed for our pricing. Please provide clarification.',
    },
  ],
  unrealistic_timeline: [
    {
      de: 'Der vorgesehene Zeitraum von {duration} erscheint für den Leistungsumfang ambitioniert. Ist mit Mehrschichtbetrieb oder Wochenendarbeit zu kalkulieren?',
      en: 'The planned duration of {duration} appears ambitious for this scope. Should we factor in shift work or weekend work?',
    },
  ],
};

const tradeContexts: Record<Trade, Record<string, string>> = {
  drywall: {
    item_context: 'Trockenbauflächen',
    typical_details: 'Plattentyp, Qualitätsstufe, Ständerwerk',
  },
  screed: {
    item_context: 'Estrichflächen',
    typical_details: 'Estrichart, Festigkeitsklasse, Aufbauhöhe',
  },
  waterproofing: {
    item_context: 'Abdichtungsflächen',
    typical_details: 'Abdichtungsart, Schichtdicke, Hochzüge',
  },
  flooring: {
    item_context: 'Bodenbelagsflächen',
    typical_details: 'Belagsart, Verlegeart, Untergrundvorbereitung',
  },
  general: {
    item_context: 'Bauleistungen',
    typical_details: 'Ausführungsdetails',
  },
};

export function generateClarificationQuestion(
  flag: Partial<RiskFlag> & { type: FlagType; title: string; description: string },
  trade: Trade
): { de: string; en: string } {
  const templates = questionTemplates[flag.type];
  const template = templates[0]; // Use first template, could be randomized

  const context = tradeContexts[trade];

  // Replace placeholders based on flag data
  let questionDe = template.de;
  let questionEn = template.en;

  // Common replacements
  const replacements: Record<string, string> = {
    '{item}': flag.title.replace(/^[^:]+:\s*/, ''),
    '{detail}': flag.title.replace(/^Fehlende Angabe:\s*/, ''),
    '{topic}': flag.title,
    '{scope}': flag.description,
    '{spec}': flag.description,
    '{stated}': extractQuantity(flag.description, 'stated'),
    '{measured}': extractQuantity(flag.description, 'measured'),
    '{duration}': extractDuration(flag.description),
    '{doc1}': flag.sources?.[0]?.documentName || 'Dokument 1',
    '{doc2}': flag.sources?.[1]?.documentName || 'Dokument 2',
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    questionDe = questionDe.replace(placeholder, value);
    questionEn = questionEn.replace(placeholder, value);
  }

  return { de: questionDe, en: questionEn };
}

function extractQuantity(description: string, type: 'stated' | 'measured'): string {
  if (type === 'stated') {
    const match = description.match(/LV:\s*([\d.,]+\s*\S+)/);
    return match?.[1] || 'X';
  } else {
    const match = description.match(/Ermittelt:\s*([\d.,]+\s*\S+)/);
    return match?.[1] || 'Y';
  }
}

function extractDuration(description: string): string {
  const match = description.match(/(\d+)\s*(Tage|Wochen|Tag|Woche)/i);
  return match ? `${match[1]} ${match[2]}` : 'dem geplanten Zeitraum';
}
```

## Risk Summary Component

```typescript
// components/RiskFlagsSummary.tsx
'use client';

import { useTranslations } from 'next-intl';
import { RiskFlag, Severity } from '@/lib/change-orders/types';

interface Props {
  flags: RiskFlag[];
  onFlagClick?: (flag: RiskFlag) => void;
}

export function RiskFlagsSummary({ flags, onFlagClick }: Props) {
  const t = useTranslations('risks');

  const severityCounts = {
    high: flags.filter(f => f.severity === 'high').length,
    medium: flags.filter(f => f.severity === 'medium').length,
    low: flags.filter(f => f.severity === 'low').length,
  };

  const totalImpact = flags.reduce(
    (sum, f) => sum + (f.estimatedImpactPercent || 0),
    0
  );

  const severityColors: Record<Severity, string> = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const severityIcons: Record<Severity, string> = {
    high: '🔴',
    medium: '🟡',
    low: '⚪',
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold">{flags.length}</div>
          <div className="text-sm text-gray-500">{t('totalFlags')}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{severityCounts.high}</div>
          <div className="text-sm text-red-600">{t('highRisk')}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{severityCounts.medium}</div>
          <div className="text-sm text-yellow-600">{t('mediumRisk')}</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">+{totalImpact.toFixed(0)}%</div>
          <div className="text-sm text-blue-600">{t('potentialImpact')}</div>
        </div>
      </div>

      {/* Flag List */}
      <div className="space-y-2">
        {flags.map(flag => (
          <div
            key={flag.id}
            onClick={() => onFlagClick?.(flag)}
            className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${severityColors[flag.severity]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span>{severityIcons[flag.severity]}</span>
                <span className="font-medium">{flag.title}</span>
              </div>
              {flag.estimatedImpactPercent && (
                <span className="text-sm font-medium">
                  +{flag.estimatedImpactPercent}%
                </span>
              )}
            </div>
            <p className="text-sm mt-1 opacity-80">{flag.description}</p>
            <div className="mt-2 text-xs opacity-60">
              {flag.sources.map((s, i) => (
                <span key={i}>
                  {s.documentName} S.{s.pageNumber}
                  {i < flag.sources.length - 1 ? ' • ' : ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Always cite sources**: Every flag must reference specific documents and pages
2. **Conservative detection**: Better to miss some issues than create false alarms
3. **Actionable questions**: Generate questions the subcontractor can actually ask
4. **Trade awareness**: Different trades have different critical details
5. **Confidence scoring**: Be transparent about detection certainty
6. **No legal claims**: Frame as "potential" issues, not definitive problems

## Common Detection Patterns by Trade

| Trade | High-Value Detections |
|-------|----------------------|
| **Drywall** | Layer count, fire rating, surface quality (Q1-Q4), room heights >3m |
| **Screed** | Thickness, heating compatibility, drying time, joint positions |
| **Waterproofing** | Layer system, upstand heights, penetration details, warranties |
| **Flooring** | Substrate requirements, transitions, expansion joints, pattern |

## Checklist

- [ ] Implement quantity comparison logic
- [ ] Create trade-specific rule sets
- [ ] Build missing detail detection
- [ ] Add conflict detection between documents
- [ ] Generate bilingual clarification questions
- [ ] Create risk summary UI component
- [ ] Store flags in database with resolution tracking
- [ ] Export flags to Excel risk sheet
- [ ] Test with real German tender documents
