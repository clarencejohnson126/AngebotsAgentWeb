import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  locale: string = 'de-DE',
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatNumber(
  value: number,
  locale: string = 'de-DE',
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatDate(
  date: Date | string,
  locale: string = 'de-DE'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function formatDateTime(
  date: Date | string,
  locale: string = 'de-DE'
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function calculateVAT(
  netAmount: number,
  vatRate: number = 19
): { vat: number; gross: number } {
  const vat = netAmount * (vatRate / 100)
  return {
    vat,
    gross: netAmount + vat,
  }
}

export function calculateMarkups(
  baseAmount: number,
  markups: {
    profit?: number
    overhead?: number
    risk?: number
    discount?: number
  }
): {
  profitAmount: number
  overheadAmount: number
  riskAmount: number
  discountAmount: number
  total: number
} {
  const { profit = 0, overhead = 0, risk = 0, discount = 0 } = markups

  const profitAmount = baseAmount * (profit / 100)
  const overheadAmount = baseAmount * (overhead / 100)
  const riskAmount = baseAmount * (risk / 100)

  const subtotalWithMarkups = baseAmount + profitAmount + overheadAmount + riskAmount
  const discountAmount = subtotalWithMarkups * (discount / 100)

  return {
    profitAmount,
    overheadAmount,
    riskAmount,
    discountAmount,
    total: subtotalWithMarkups - discountAmount,
  }
}

export function generateOfferNumber(prefix: string = 'ANG'): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
