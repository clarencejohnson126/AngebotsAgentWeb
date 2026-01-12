/**
 * German Construction Utilities
 *
 * Comprehensive utilities for processing German construction documents,
 * based on analysis of real offers, LVs, contracts, and Preisspiegel
 * from Trockenbau, Estrich, Abdichtung, and Bodenbelag trades.
 */

// Types and constants
export * from './types';

// LV parsing utilities
export {
  parsePositionNumber,
  isPositionNumber,
  getHierarchyLevel,
  parseEinheit,
  detectLVMarker,
  parseGermanNumber,
  formatGermanNumber,
  formatGermanCurrency,
  extractDetailReferences,
  extractFabrikat,
  extractDINReferences,
  parseLVLine,
  validateLVPosition,
  calculateGesamtpreis,
  type ParsedLVLine,
} from './lv-parser';

// Preisspiegel generation
export {
  generatePreisspiegel,
  generatePreisspiegelBuffer,
  generatePreisspiegelFilename,
  type PreisspiegelOptions,
} from './preisspiegel-generator';

// Offer generation
export {
  createOffer,
  generateOfferLetterText,
  calculateBuergschaftsbetrag,
  generateBuergschaftText,
  generateOfferFilename,
  type CreateOfferInput,
} from './offer-generator';

// Hardcoded domain knowledge (always applied)
export {
  BLUEPRINT_STYLES,
  ROOM_CATEGORIES,
  CONSTRUCTION_UNITS,
  LV_PATTERNS,
  GEWERKE,
  RISK_RULES,
  OFFER_TEMPLATES,
  STANDARD_EXCLUSIONS,
  STANDARD_ASSUMPTIONS,
  CLAUDE_EXTRACTION_PROMPTS,
  parseGermanNumber as parseGermanNumberSkills,
  formatGermanNumber as formatGermanNumberSkills,
  formatGermanCurrency as formatGermanCurrencySkills,
  categorizeRoom,
  getRoomFactor,
  isOutdoorRoom,
} from './skills';
