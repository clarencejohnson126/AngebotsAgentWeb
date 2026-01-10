# Competitive Pricing Strategy for Construction Subcontractors

## Overview
This skill covers building competitive yet profitable offers for construction subcontractors in the German/DACH market. The goal is optimal price positioning—winning contracts without leaving money on the table or underbidding into losses. Combines market intelligence, cost calculation, risk adjustment, and strategic markup decisions.

## When to Use
- Calculating unit prices (EP) for offer line items
- Adjusting prices based on detected risks (Nachtragspotenziale)
- Setting markups for different project types and clients
- Building a company price library with competitive ranges
- Analyzing won/lost offers to refine pricing strategy
- Regional price adjustments within Germany

## Core Principles

### The Pricing Sweet Spot
```
Too Low                    Sweet Spot                    Too High
   │                           │                            │
   │  Win but lose money       │  Win with healthy margin   │  Lose to competition
   │  Unsustainable            │  Sustainable growth        │  Empty pipeline
   ▼                           ▼                            ▼
```

### Price Structure Breakdown
```
Final Price = (Material + Labor + Equipment) × (1 + Overhead%) × (1 + Profit%) × (1 + Risk%)

Components:
├── Direct Costs (60-75% of price)
│   ├── Material costs
│   ├── Labor costs (wages × hours)
│   └── Equipment/tools
├── Overhead (8-15%)
│   ├── Office, insurance, vehicles
│   ├── Management, admin staff
│   └── Training, certifications
├── Profit (5-15%)
│   └── Target margin for growth
└── Risk Buffer (0-20%)
    └── Based on detected Nachtragspotenziale
```

## Project Structure

```
├── lib/
│   └── pricing/
│       ├── calculator.ts           # Price calculation engine
│       ├── market-data.ts          # Regional price ranges
│       ├── cost-models/
│       │   ├── drywall.ts
│       │   ├── screed.ts
│       │   ├── waterproofing.ts
│       │   └── flooring.ts
│       ├── risk-adjustment.ts      # Risk-based price adjustment
│       ├── strategy.ts             # Pricing strategy logic
│       └── types.ts
├── data/
│   └── price-ranges/
│       ├── de-2024.json           # German market prices
│       └── at-2024.json           # Austrian market prices
```

## Type Definitions (`lib/pricing/types.ts`)

```typescript
export type Trade = 'drywall' | 'screed' | 'waterproofing' | 'flooring';

export type Region = 
  | 'de-north'      // Hamburg, Bremen, Niedersachsen, SH, MV
  | 'de-west'       // NRW, Rheinland-Pfalz, Saarland
  | 'de-south'      // Bayern, Baden-Württemberg
  | 'de-east'       // Berlin, Brandenburg, Sachsen, SA, Thüringen
  | 'at'            // Austria
  | 'ch';           // Switzerland

export type ProjectType = 
  | 'residential'   // Wohnungsbau
  | 'commercial'    // Gewerbebau
  | 'public'        // Öffentlicher Bau
  | 'industrial';   // Industriebau

export type ClientType = 
  | 'general_contractor'  // Generalunternehmer
  | 'developer'           // Bauträger
  | 'direct_client'       // Direktvergabe
  | 'public_authority';   // Öffentlicher Auftraggeber

export interface CostComponents {
  material: number;        // €
  labor: number;           // €
  laborHours: number;      // hours
  equipment: number;       // €
  subcontractor?: number;  // € for specialized work
}

export interface PriceCalculation {
  directCosts: CostComponents;
  directCostTotal: number;
  overheadPercent: number;
  overheadAmount: number;
  profitPercent: number;
  profitAmount: number;
  riskBufferPercent: number;
  riskBufferAmount: number;
  unitPrice: number;        // Final EP
  totalPrice: number;       // EP × quantity
  pricePerSqm?: number;     // For comparison
  confidence: 'high' | 'medium' | 'low';
  marketPosition: 'below' | 'competitive' | 'premium';
}

export interface MarketPriceRange {
  trade: Trade;
  itemCode: string;
  description: string;
  unit: string;
  region: Region;
  lowPrice: number;        // Bottom 25% of market
  midPrice: number;        // Market median
  highPrice: number;       // Top 25% (premium)
  lastUpdated: Date;
  source: string;
  notes?: string;
}

export interface PricingStrategy {
  targetMargin: number;           // Target profit %
  overheadRate: number;           // Company overhead %
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredPosition: 'value' | 'mid-market' | 'premium';
  minimumMargin: number;          // Walk-away threshold
}

export interface RiskAdjustment {
  flagId: string;
  description: string;
  impactPercent: number;
  priceAdjustment: number;        // € amount to add
  included: boolean;              // Whether to include in base price
}
```

## Market Price Data (`lib/pricing/market-data.ts`)

```typescript
import { MarketPriceRange, Region, Trade } from './types';

// German market prices - 2024 baseline
// Sources: BKI Baukosteninformationszentrum, industry surveys, tender analysis
// IMPORTANT: These are INDICATIVE RANGES - always verify with current market conditions

export const marketPrices: MarketPriceRange[] = [
  // ═══════════════════════════════════════════════════════════════
  // TROCKENBAU (Drywall)
  // ═══════════════════════════════════════════════════════════════
  {
    trade: 'drywall',
    itemCode: 'TB-W-001',
    description: 'Metallständerwand, 1-lagig beplankt, 100mm, inkl. Dämmung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 42.00,
    midPrice: 52.00,
    highPrice: 65.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'CW75, 1x12.5mm GKB, 60mm MW',
  },
  {
    trade: 'drywall',
    itemCode: 'TB-W-002',
    description: 'Metallständerwand, 2-lagig beplankt, 125mm, inkl. Dämmung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 58.00,
    midPrice: 72.00,
    highPrice: 88.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'CW75, 2x12.5mm GKB, 60mm MW, Q2',
  },
  {
    trade: 'drywall',
    itemCode: 'TB-W-003',
    description: 'Brandschutzwand F90, 2-lagig, inkl. Dämmung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 78.00,
    midPrice: 95.00,
    highPrice: 115.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'CW100, 2x15mm GKF, 80mm MW',
  },
  {
    trade: 'drywall',
    itemCode: 'TB-D-001',
    description: 'Abhangdecke Metallunterkonstruktion, 1-lagig',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 38.00,
    midPrice: 48.00,
    highPrice: 62.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'CD60/27, 1x12.5mm GKB, Abhängehöhe bis 50cm',
  },
  {
    trade: 'drywall',
    itemCode: 'TB-V-001',
    description: 'Vorsatzschale auf Direktabhänger, 1-lagig',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 32.00,
    midPrice: 42.00,
    highPrice: 54.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
  },

  // ═══════════════════════════════════════════════════════════════
  // ESTRICH (Screed)
  // ═══════════════════════════════════════════════════════════════
  {
    trade: 'screed',
    itemCode: 'EST-ZE-001',
    description: 'Zementestrich CT-C25-F4, 65mm, auf Trennlage',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 18.00,
    midPrice: 24.00,
    highPrice: 32.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Inkl. Randstreifen, ohne Dämmung',
  },
  {
    trade: 'screed',
    itemCode: 'EST-ZE-002',
    description: 'Zementestrich CT-C25-F4, 65mm, schwimmend auf Dämmung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 28.00,
    midPrice: 36.00,
    highPrice: 45.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Inkl. 40mm EPS, Randstreifen, PE-Folie',
  },
  {
    trade: 'screed',
    itemCode: 'EST-FBH-001',
    description: 'Heizestrich CT-C25-F4, 65mm, mit FBH-System',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 45.00,
    midPrice: 58.00,
    highPrice: 72.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Inkl. Systemdämmung, ohne Heizrohr',
  },
  {
    trade: 'screed',
    itemCode: 'EST-CAF-001',
    description: 'Calciumsulfat-Fließestrich CAF-C30-F5, 45mm',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 22.00,
    midPrice: 28.00,
    highPrice: 36.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
  },

  // ═══════════════════════════════════════════════════════════════
  // ABDICHTUNG (Waterproofing)
  // ═══════════════════════════════════════════════════════════════
  {
    trade: 'waterproofing',
    itemCode: 'ABD-B-001',
    description: 'Bituminöse Bauwerksabdichtung, 1-lagig, Kaltverklebung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 28.00,
    midPrice: 38.00,
    highPrice: 52.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Inkl. Voranstrich, ohne Hochzüge',
  },
  {
    trade: 'waterproofing',
    itemCode: 'ABD-B-002',
    description: 'Bituminöse Bauwerksabdichtung, 2-lagig, vollflächig verklebt',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 48.00,
    midPrice: 62.00,
    highPrice: 78.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
  },
  {
    trade: 'waterproofing',
    itemCode: 'ABD-FLK-001',
    description: 'Flüssigkunststoff-Abdichtung (PMMA), inkl. Vlieseinlage',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 55.00,
    midPrice: 72.00,
    highPrice: 92.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Für Balkone, Terrassen',
  },
  {
    trade: 'waterproofing',
    itemCode: 'ABD-HZ-001',
    description: 'Hochzug Abdichtung, bis 30cm',
    unit: 'lfm',
    region: 'de-south',
    lowPrice: 18.00,
    midPrice: 26.00,
    highPrice: 35.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
  },

  // ═══════════════════════════════════════════════════════════════
  // BODENBELAG (Flooring)
  // ═══════════════════════════════════════════════════════════════
  {
    trade: 'flooring',
    itemCode: 'BOD-FLI-001',
    description: 'Bodenfliesen 30x60cm, Dünnbettverlegung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 45.00,
    midPrice: 58.00,
    highPrice: 75.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Ohne Material, nur Verlegearbeiten',
  },
  {
    trade: 'flooring',
    itemCode: 'BOD-FLI-002',
    description: 'Großformatfliesen 60x120cm, Dünnbettverlegung',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 62.00,
    midPrice: 78.00,
    highPrice: 98.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
  },
  {
    trade: 'flooring',
    itemCode: 'BOD-PAR-001',
    description: 'Fertigparkett schwimmend verlegt, inkl. Trittschall',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 28.00,
    midPrice: 38.00,
    highPrice: 52.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Ohne Material',
  },
  {
    trade: 'flooring',
    itemCode: 'BOD-CV-001',
    description: 'CV-Belag / Linoleum vollflächig geklebt',
    unit: 'm²',
    region: 'de-south',
    lowPrice: 18.00,
    midPrice: 25.00,
    highPrice: 35.00,
    lastUpdated: new Date('2024-06-01'),
    source: 'BKI/Market Analysis',
    notes: 'Ohne Material, inkl. Nahtschweißen',
  },
];

// Regional adjustment factors (relative to de-south = 1.0)
export const regionalFactors: Record<Region, number> = {
  'de-south': 1.00,    // Bayern, BaWü - highest costs
  'de-west': 0.95,     // NRW, etc.
  'de-north': 0.92,    // Hamburg area slightly lower
  'de-east': 0.85,     // Eastern Germany lower costs
  'at': 1.05,          // Austria slightly higher
  'ch': 1.45,          // Switzerland significantly higher
};

// Project type adjustments
export const projectTypeFactors: Record<ProjectType, number> = {
  residential: 1.00,   // Baseline
  commercial: 1.05,    // Slightly higher (complexity)
  public: 0.95,        // Lower margins, but reliable payment
  industrial: 1.10,    // Higher complexity, special requirements
};

// Client type adjustments
export const clientTypeFactors: Record<ClientType, number> = {
  general_contractor: 0.95,    // Lower (volume, but tight margins)
  developer: 1.00,             // Standard
  direct_client: 1.08,         // Higher (more service, coordination)
  public_authority: 0.92,      // Lower margins, formal process
};

export function getMarketPrice(
  trade: Trade,
  itemCode: string,
  region: Region = 'de-south'
): MarketPriceRange | undefined {
  const basePrice = marketPrices.find(
    p => p.trade === trade && p.itemCode === itemCode
  );
  
  if (!basePrice) return undefined;

  const factor = regionalFactors[region];
  
  return {
    ...basePrice,
    region,
    lowPrice: basePrice.lowPrice * factor,
    midPrice: basePrice.midPrice * factor,
    highPrice: basePrice.highPrice * factor,
  };
}

export function searchMarketPrices(
  trade: Trade,
  searchTerm: string,
  region: Region = 'de-south'
): MarketPriceRange[] {
  const termLower = searchTerm.toLowerCase();
  
  return marketPrices
    .filter(p => 
      p.trade === trade && 
      (p.description.toLowerCase().includes(termLower) ||
       p.notes?.toLowerCase().includes(termLower))
    )
    .map(p => ({
      ...p,
      region,
      lowPrice: p.lowPrice * regionalFactors[region],
      midPrice: p.midPrice * regionalFactors[region],
      highPrice: p.highPrice * regionalFactors[region],
    }));
}
```

## Price Calculator (`lib/pricing/calculator.ts`)

```typescript
import {
  Trade,
  Region,
  ProjectType,
  ClientType,
  CostComponents,
  PriceCalculation,
  PricingStrategy,
  RiskAdjustment,
  MarketPriceRange,
} from './types';
import {
  getMarketPrice,
  regionalFactors,
  projectTypeFactors,
  clientTypeFactors,
} from './market-data';

interface CalculationInput {
  // Item details
  trade: Trade;
  itemCode?: string;
  description: string;
  unit: string;
  quantity: number;

  // Cost inputs (if known)
  materialCost?: number;
  laborHours?: number;
  hourlyRate?: number;
  equipmentCost?: number;

  // Context
  region: Region;
  projectType: ProjectType;
  clientType: ClientType;

  // Strategy
  strategy: PricingStrategy;

  // Risk adjustments from change order detection
  riskAdjustments?: RiskAdjustment[];
}

export class PriceCalculator {
  private input: CalculationInput;
  private marketData?: MarketPriceRange;

  constructor(input: CalculationInput) {
    this.input = input;
    if (input.itemCode) {
      this.marketData = getMarketPrice(input.trade, input.itemCode, input.region);
    }
  }

  calculate(): PriceCalculation {
    // 1. Calculate or estimate direct costs
    const directCosts = this.calculateDirectCosts();
    const directCostTotal = 
      directCosts.material + 
      directCosts.labor + 
      directCosts.equipment + 
      (directCosts.subcontractor || 0);

    // 2. Apply overhead
    const overheadPercent = this.input.strategy.overheadRate;
    const overheadAmount = directCostTotal * overheadPercent;

    // 3. Calculate profit
    const profitPercent = this.calculateTargetProfit();
    const costPlusOverhead = directCostTotal + overheadAmount;
    const profitAmount = costPlusOverhead * profitPercent;

    // 4. Calculate risk buffer based on detected issues
    const { riskBufferPercent, riskBufferAmount } = this.calculateRiskBuffer(
      costPlusOverhead + profitAmount
    );

    // 5. Final unit price
    const totalBeforeRisk = costPlusOverhead + profitAmount;
    const unitPrice = (totalBeforeRisk + riskBufferAmount) / this.input.quantity;
    const totalPrice = unitPrice * this.input.quantity;

    // 6. Determine market position
    const marketPosition = this.determineMarketPosition(unitPrice);
    const confidence = this.calculateConfidence();

    return {
      directCosts,
      directCostTotal,
      overheadPercent,
      overheadAmount,
      profitPercent,
      profitAmount,
      riskBufferPercent,
      riskBufferAmount,
      unitPrice: Math.round(unitPrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      pricePerSqm: this.input.unit === 'm²' ? unitPrice : undefined,
      confidence,
      marketPosition,
    };
  }

  private calculateDirectCosts(): CostComponents {
    const { materialCost, laborHours, hourlyRate, equipmentCost } = this.input;

    // If we have actual cost data, use it
    if (materialCost !== undefined && laborHours !== undefined) {
      const rate = hourlyRate || this.getDefaultHourlyRate();
      return {
        material: materialCost * this.input.quantity,
        labor: laborHours * rate * this.input.quantity,
        laborHours: laborHours * this.input.quantity,
        equipment: (equipmentCost || 0) * this.input.quantity,
      };
    }

    // Otherwise, estimate from market data
    return this.estimateFromMarketData();
  }

  private estimateFromMarketData(): CostComponents {
    if (!this.marketData) {
      // Fallback: very rough estimate
      const estimatedUnitCost = 50; // €/m² baseline
      const factor = regionalFactors[this.input.region];
      const adjustedCost = estimatedUnitCost * factor * this.input.quantity;

      return {
        material: adjustedCost * 0.40, // 40% material
        labor: adjustedCost * 0.50,    // 50% labor
        laborHours: adjustedCost * 0.50 / this.getDefaultHourlyRate(),
        equipment: adjustedCost * 0.10, // 10% equipment
      };
    }

    // Use market data to derive cost structure
    // Typical cost breakdown: 35-45% material, 45-55% labor, 5-10% equipment
    const basePrice = this.marketData.midPrice;
    const totalCost = basePrice * this.input.quantity;
    
    // Back-calculate costs (removing typical markup of ~25%)
    const costBase = totalCost / 1.25;

    return {
      material: costBase * 0.40,
      labor: costBase * 0.50,
      laborHours: (costBase * 0.50) / this.getDefaultHourlyRate(),
      equipment: costBase * 0.10,
    };
  }

  private getDefaultHourlyRate(): number {
    // Fully burdened labor rates by trade (Germany 2024)
    const rates: Record<Trade, number> = {
      drywall: 52,        // €/hour
      screed: 48,
      waterproofing: 55,
      flooring: 50,
    };
    return rates[this.input.trade];
  }

  private calculateTargetProfit(): number {
    const base = this.input.strategy.targetMargin;
    
    // Adjust based on project and client type
    const projectFactor = projectTypeFactors[this.input.projectType];
    const clientFactor = clientTypeFactors[this.input.clientType];
    
    // Aggressive strategy targets higher margins
    const strategyMultiplier = {
      conservative: 0.9,
      moderate: 1.0,
      aggressive: 1.15,
    }[this.input.strategy.riskTolerance];

    return base * projectFactor * clientFactor * strategyMultiplier;
  }

  private calculateRiskBuffer(baseAmount: number): {
    riskBufferPercent: number;
    riskBufferAmount: number;
  } {
    const { riskAdjustments, strategy } = this.input;

    if (!riskAdjustments || riskAdjustments.length === 0) {
      return { riskBufferPercent: 0, riskBufferAmount: 0 };
    }

    // Sum up all included risk adjustments
    const includedRisks = riskAdjustments.filter(r => r.included);
    const totalRiskPercent = includedRisks.reduce(
      (sum, r) => sum + r.impactPercent,
      0
    );

    // Apply risk tolerance factor
    const toleranceFactor = {
      conservative: 1.0,    // Include full risk buffer
      moderate: 0.75,       // Include 75%
      aggressive: 0.5,      // Include 50% (accept more risk)
    }[strategy.riskTolerance];

    const adjustedRiskPercent = totalRiskPercent * toleranceFactor;
    
    // Cap risk buffer at reasonable levels
    const cappedRiskPercent = Math.min(adjustedRiskPercent, 25) / 100;

    return {
      riskBufferPercent: cappedRiskPercent,
      riskBufferAmount: baseAmount * cappedRiskPercent,
    };
  }

  private determineMarketPosition(
    unitPrice: number
  ): 'below' | 'competitive' | 'premium' {
    if (!this.marketData) return 'competitive';

    if (unitPrice < this.marketData.lowPrice) return 'below';
    if (unitPrice > this.marketData.highPrice) return 'premium';
    return 'competitive';
  }

  private calculateConfidence(): 'high' | 'medium' | 'low' {
    const hasOwnCosts = this.input.materialCost !== undefined;
    const hasMarketData = this.marketData !== undefined;

    if (hasOwnCosts && hasMarketData) return 'high';
    if (hasOwnCosts || hasMarketData) return 'medium';
    return 'low';
  }

  // Helper: Get recommended price range for winning
  getWinningPriceRange(): { min: number; recommended: number; max: number } {
    if (!this.marketData) {
      const calc = this.calculate();
      return {
        min: calc.unitPrice * 0.9,
        recommended: calc.unitPrice,
        max: calc.unitPrice * 1.1,
      };
    }

    // Position based on strategy
    const position = this.input.strategy.preferredPosition;
    
    switch (position) {
      case 'value':
        return {
          min: this.marketData.lowPrice,
          recommended: this.marketData.lowPrice * 1.05,
          max: this.marketData.midPrice * 0.95,
        };
      case 'premium':
        return {
          min: this.marketData.midPrice * 1.05,
          recommended: this.marketData.highPrice * 0.95,
          max: this.marketData.highPrice,
        };
      default: // mid-market
        return {
          min: this.marketData.lowPrice * 1.1,
          recommended: this.marketData.midPrice,
          max: this.marketData.highPrice * 0.9,
        };
    }
  }
}

// Convenience function for quick calculations
export function calculateUnitPrice(input: CalculationInput): PriceCalculation {
  const calculator = new PriceCalculator(input);
  return calculator.calculate();
}
```

## Risk-Adjusted Pricing (`lib/pricing/risk-adjustment.ts`)

```typescript
import { RiskFlag } from '../change-orders/types';
import { RiskAdjustment, PricingStrategy } from './types';

export function convertRiskFlagsToAdjustments(
  flags: RiskFlag[],
  strategy: PricingStrategy
): RiskAdjustment[] {
  return flags.map(flag => {
    // Decide whether to include in base price based on severity and strategy
    const shouldInclude = determineInclusion(flag, strategy);
    
    return {
      flagId: flag.id,
      description: flag.title,
      impactPercent: flag.estimatedImpactPercent || getDefaultImpact(flag),
      priceAdjustment: 0, // Calculated from percent
      included: shouldInclude,
    };
  });
}

function determineInclusion(flag: RiskFlag, strategy: PricingStrategy): boolean {
  // Always include high-severity risks for conservative strategy
  if (strategy.riskTolerance === 'conservative' && flag.severity === 'high') {
    return true;
  }

  // Include medium risks for conservative/moderate
  if (flag.severity === 'medium' && strategy.riskTolerance !== 'aggressive') {
    return true;
  }

  // Aggressive strategy only includes high risks partially
  if (strategy.riskTolerance === 'aggressive') {
    return flag.severity === 'high';
  }

  return false;
}

function getDefaultImpact(flag: RiskFlag): number {
  // Default impact percentages by flag type
  const defaults: Record<string, number> = {
    quantity_mismatch: 8,
    missing_detail: 5,
    conflicting_docs: 10,
    scope_gap: 7,
    ambiguous_spec: 5,
    unrealistic_timeline: 10,
  };
  return defaults[flag.type] || 5;
}

export function generatePricingRecommendation(
  basePrice: number,
  riskAdjustments: RiskAdjustment[],
  strategy: PricingStrategy
): {
  recommendedPrice: number;
  riskSummary: string;
  warnings: string[];
} {
  const includedRisks = riskAdjustments.filter(r => r.included);
  const excludedRisks = riskAdjustments.filter(r => !r.included);

  const totalIncludedRisk = includedRisks.reduce(
    (sum, r) => sum + r.impactPercent,
    0
  );
  
  const recommendedPrice = basePrice * (1 + totalIncludedRisk / 100);

  const warnings: string[] = [];

  // Warn about excluded high-impact risks
  const highExcludedRisks = excludedRisks.filter(r => r.impactPercent > 10);
  if (highExcludedRisks.length > 0) {
    warnings.push(
      `${highExcludedRisks.length} Risiken mit >10% Auswirkung nicht eingepreist. ` +
      `Klären Sie diese vor Angebotsabgabe.`
    );
  }

  // Warn if total risk buffer exceeds threshold
  if (totalIncludedRisk > 20) {
    warnings.push(
      `Hoher Risikoaufschlag von ${totalIncludedRisk.toFixed(0)}%. ` +
      `Prüfen Sie ob alle Risiken tatsächlich eingepreist werden müssen.`
    );
  }

  const riskSummary = `${includedRisks.length} Risiken eingepreist (+${totalIncludedRisk.toFixed(1)}%), ` +
                      `${excludedRisks.length} Risiken nicht eingepreist`;

  return {
    recommendedPrice: Math.round(recommendedPrice * 100) / 100,
    riskSummary,
    warnings,
  };
}
```

## Pricing Strategy Presets (`lib/pricing/strategy.ts`)

```typescript
import { PricingStrategy, ClientType, ProjectType } from './types';

// Pre-configured strategies for common scenarios
export const strategyPresets: Record<string, PricingStrategy> = {
  // "Ich will den Auftrag" - aggressive pricing for must-win projects
  mustWin: {
    targetMargin: 0.05,          // 5% profit
    overheadRate: 0.08,          // Minimal overhead allocation
    riskTolerance: 'aggressive',
    preferredPosition: 'value',
    minimumMargin: 0.02,         // 2% absolute minimum
  },

  // Standard balanced approach
  balanced: {
    targetMargin: 0.10,          // 10% profit
    overheadRate: 0.12,          // Standard overhead
    riskTolerance: 'moderate',
    preferredPosition: 'mid-market',
    minimumMargin: 0.05,         // 5% minimum
  },

  // Premium positioning for quality-focused clients
  premium: {
    targetMargin: 0.15,          // 15% profit
    overheadRate: 0.12,
    riskTolerance: 'conservative',
    preferredPosition: 'premium',
    minimumMargin: 0.08,
  },

  // Safe approach for unclear scope
  defensive: {
    targetMargin: 0.12,
    overheadRate: 0.15,          // Higher overhead buffer
    riskTolerance: 'conservative',
    preferredPosition: 'mid-market',
    minimumMargin: 0.08,
  },
};

// Recommend strategy based on context
export function recommendStrategy(
  projectType: ProjectType,
  clientType: ClientType,
  riskFlagCount: number,
  isRepeatClient: boolean
): { strategy: PricingStrategy; reasoning: string } {
  // Public tenders: usually price-driven
  if (clientType === 'public_authority') {
    return {
      strategy: { ...strategyPresets.balanced, preferredPosition: 'value' },
      reasoning: 'Öffentliche Ausschreibung: Preiswettbewerb, aber faire Kalkulation',
    };
  }

  // High risk projects: defensive approach
  if (riskFlagCount >= 5) {
    return {
      strategy: strategyPresets.defensive,
      reasoning: `${riskFlagCount} Risikofaktoren erkannt: Konservative Kalkulation empfohlen`,
    };
  }

  // Repeat clients: can be more competitive
  if (isRepeatClient) {
    return {
      strategy: { ...strategyPresets.balanced, targetMargin: 0.08 },
      reasoning: 'Bestandskunde: Leicht reduzierte Marge für Kundenbindung',
    };
  }

  // Premium projects
  if (projectType === 'commercial' || projectType === 'industrial') {
    return {
      strategy: strategyPresets.premium,
      reasoning: 'Gewerbeprojekt: Qualitätsfokus erlaubt Premium-Positionierung',
    };
  }

  return {
    strategy: strategyPresets.balanced,
    reasoning: 'Standardprojekt: Ausgewogene Kalkulation',
  };
}
```

## Pricing UI Component

```typescript
// components/PriceCalculator.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PriceCalculation, PricingStrategy, RiskAdjustment } from '@/lib/pricing/types';
import { calculateUnitPrice } from '@/lib/pricing/calculator';
import { strategyPresets, recommendStrategy } from '@/lib/pricing/strategy';

interface Props {
  trade: Trade;
  lineItems: LineItem[];
  riskFlags: RiskFlag[];
  projectContext: ProjectContext;
  onPriceUpdate: (prices: Map<string, PriceCalculation>) => void;
}

export function PriceCalculatorPanel({ trade, lineItems, riskFlags, projectContext, onPriceUpdate }: Props) {
  const t = useTranslations('pricing');
  const [strategy, setStrategy] = useState<PricingStrategy>(strategyPresets.balanced);
  const [calculations, setCalculations] = useState<Map<string, PriceCalculation>>(new Map());

  const { strategy: recommended, reasoning } = recommendStrategy(
    projectContext.projectType,
    projectContext.clientType,
    riskFlags.length,
    projectContext.isRepeatClient
  );

  const calculateAll = () => {
    const newCalcs = new Map<string, PriceCalculation>();

    for (const item of lineItems) {
      const riskAdjustments = convertRiskFlagsToAdjustments(riskFlags, strategy);
      
      const calc = calculateUnitPrice({
        trade,
        itemCode: item.itemCode,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        region: projectContext.region,
        projectType: projectContext.projectType,
        clientType: projectContext.clientType,
        strategy,
        riskAdjustments,
      });

      newCalcs.set(item.id, calc);
    }

    setCalculations(newCalcs);
    onPriceUpdate(newCalcs);
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{t('priceCalculation')}</h2>

      {/* Strategy Recommendation */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="font-medium text-blue-800">{t('recommendedStrategy')}</div>
        <p className="text-sm text-blue-600 mt-1">{reasoning}</p>
        <button
          onClick={() => setStrategy(recommended)}
          className="mt-2 text-sm text-blue-700 underline"
        >
          {t('applyRecommendation')}
        </button>
      </div>

      {/* Strategy Selection */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(strategyPresets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => setStrategy(preset)}
            className={`p-3 rounded border text-sm ${
              strategy === preset
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{t(`strategies.${key}`)}</div>
            <div className="text-xs opacity-75">
              {(preset.targetMargin * 100).toFixed(0)}% {t('targetProfit')}
            </div>
          </button>
        ))}
      </div>

      {/* Risk Summary */}
      {riskFlags.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="font-medium text-yellow-800">
            {riskFlags.length} {t('riskFactorsDetected')}
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            {t('riskBufferExplanation', { 
              tolerance: t(`tolerance.${strategy.riskTolerance}`) 
            })}
          </p>
        </div>
      )}

      {/* Calculate Button */}
      <button
        onClick={calculateAll}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
      >
        {t('calculatePrices')}
      </button>

      {/* Results */}
      {calculations.size > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">{t('calculatedPrices')}</h3>
          {lineItems.map(item => {
            const calc = calculations.get(item.id);
            if (!calc) return null;

            return (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {calc.unitPrice.toFixed(2)} €/{item.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('total')}: {calc.totalPrice.toFixed(2)} €
                    </div>
                  </div>
                </div>

                {/* Market Position Indicator */}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    calc.marketPosition === 'below' ? 'bg-yellow-100 text-yellow-800' :
                    calc.marketPosition === 'premium' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {t(`marketPosition.${calc.marketPosition}`)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    calc.confidence === 'high' ? 'bg-green-100' :
                    calc.confidence === 'medium' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {t(`confidence.${calc.confidence}`)}
                  </span>
                </div>

                {/* Cost Breakdown (collapsible) */}
                <details className="mt-2">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    {t('showBreakdown')}
                  </summary>
                  <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                    <div>{t('material')}:</div>
                    <div className="text-right">{calc.directCosts.material.toFixed(2)} €</div>
                    <div>{t('labor')}:</div>
                    <div className="text-right">{calc.directCosts.labor.toFixed(2)} €</div>
                    <div>{t('overhead')} ({(calc.overheadPercent * 100).toFixed(0)}%):</div>
                    <div className="text-right">{calc.overheadAmount.toFixed(2)} €</div>
                    <div>{t('profit')} ({(calc.profitPercent * 100).toFixed(0)}%):</div>
                    <div className="text-right">{calc.profitAmount.toFixed(2)} €</div>
                    {calc.riskBufferAmount > 0 && (
                      <>
                        <div>{t('riskBuffer')} ({(calc.riskBufferPercent * 100).toFixed(0)}%):</div>
                        <div className="text-right">{calc.riskBufferAmount.toFixed(2)} €</div>
                      </>
                    )}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Never race to the bottom**: Minimum margins exist for a reason
2. **Price detected risks**: Use change order flags to justify buffers
3. **Know your market**: Regional differences matter significantly
4. **Document assumptions**: Make pricing transparent and auditable
5. **Track win/loss**: Analyze which prices won and lost to refine strategy
6. **Client relationships**: Consider long-term value, not just this project
7. **Update regularly**: Market prices shift—keep data current

## Pricing Confidence Guidelines

| Confidence | When to Apply | Action |
|------------|---------------|--------|
| **High** | Own cost data + market data available | Price with confidence |
| **Medium** | Either own costs OR market data | Add 5% buffer |
| **Low** | Neither available | Add 10% buffer or get more data |

## Checklist

- [ ] Set up market price database with German prices
- [ ] Implement price calculator with cost components
- [ ] Add regional adjustment factors
- [ ] Create risk-to-price conversion logic
- [ ] Build strategy presets and recommendation engine
- [ ] Create pricing UI with market position indicators
- [ ] Add confidence scoring to calculations
- [ ] Store pricing history for win/loss analysis
- [ ] Test with real project data
- [ ] Verify German number formatting (€ X.XXX,XX)
