import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CurrencyDetails {
  code: string;
  symbol: string;
  label: string;
  standardPrice: number;
  premiumPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Available currencies
  public readonly supportedCurrencies: CurrencyDetails[] = [
    { code: 'MAD', symbol: 'DH', label: 'MAD - Dirham Marocain (DH)', standardPrice: 299.00, premiumPrice: 599.00 },
    { code: 'EUR', symbol: '€', label: 'EUR - Euro (€)', standardPrice: 29.90, premiumPrice: 59.90 },
    { code: 'USD', symbol: '$', label: 'USD - Dollar ($)', standardPrice: 29.90, premiumPrice: 59.90 },
    { code: 'CAD', symbol: '$', label: 'CAD - Dollar Canadien ($)', standardPrice: 39.90, premiumPrice: 79.90 },
    { code: 'GBP', symbol: '£', label: 'GBP - Livre Sterling (£)', standardPrice: 24.90, premiumPrice: 49.90 },
    { code: 'CHF', symbol: 'CHF', label: 'CHF - Franc Suisse (CHF)', standardPrice: 29.90, premiumPrice: 59.90 }
  ];

  // State Signals
  public readonly activeCurrency = signal<string>('MAD');
  public readonly detectedCountry = signal<string>('');
  public readonly isAutoDetected = signal<boolean>(false);

  public readonly activeSymbol = computed(() => this.getSymbol(this.activeCurrency()));

  public readonly activePrices = computed(() => {
    const code = this.activeCurrency();
    const found = this.supportedCurrencies.find(c => c.code === code);
    return found ? { standard: found.standardPrice, premium: found.premiumPrice } : { standard: 299.00, premium: 599.00 };
  });

  constructor(private http: HttpClient) {
    this.initCurrency();
  }

  /**
   * Initialize currency: Manual Preference > Geo-IP Auto-Detection > Browser Locale Fallback > Default (MAD for local testing)
   */
  public async initCurrency(): Promise<string> {
    // 1. Check manual override preference
    const manualPref = localStorage.getItem('preferred_currency');
    if (manualPref && this.isValidCurrency(manualPref)) {
      this.activeCurrency.set(manualPref);
      this.isAutoDetected.set(false);
      return manualPref;
    }

    // 2. Perform Geo-IP lookup
    try {
      const geoData: any = await firstValueFrom(
        this.http.get('https://ipapi.co/json/')
      );
      if (geoData && geoData.country_code && !geoData.error && !geoData.reserved) {
        const countryCode = geoData.country_code.toUpperCase();
        this.detectedCountry.set(geoData.country_name || countryCode);
        const mappedCurrency = this.mapCountryToCurrency(countryCode);
        
        this.activeCurrency.set(mappedCurrency);
        this.isAutoDetected.set(true);
        localStorage.setItem('detected_currency', mappedCurrency);
        return mappedCurrency;
      }
    } catch (e) {
      console.warn('Geo-IP lookup fallback to browser locale/local default:', e);
    }

    // 3. Fallback to Browser Locale / Timezone
    const browserCurrency = this.detectFromBrowserLocale();
    this.activeCurrency.set(browserCurrency);
    this.isAutoDetected.set(true);
    return browserCurrency;
  }

  /**
   * Set user preferred currency manually
   */
  public setManualCurrency(currencyCode: string): void {
    if (!this.isValidCurrency(currencyCode)) return;
    this.activeCurrency.set(currencyCode);
    this.isAutoDetected.set(false);
    localStorage.setItem('preferred_currency', currencyCode);
  }

  /**
   * Reset preference to re-trigger automatic detection
   */
  public resetToAutoDetection(): void {
    localStorage.removeItem('preferred_currency');
    this.initCurrency();
  }

  /**
   * Helper: Get symbol for currency code
   */
  public getSymbol(code: string): string {
    switch (code) {
      case 'MAD': return 'DH';
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'CAD': return '$';
      case 'GBP': return '£';
      case 'CHF': return 'CHF';
      default: return code;
    }
  }

  // Exchange Rates relative to 1 EUR
  private readonly exchangeRates: Record<string, number> = {
    EUR: 1.0,
    MAD: 10.80,
    USD: 1.08,
    CAD: 1.48,
    GBP: 0.85,
    CHF: 0.95
  };

  /**
   * Convert an amount from base currency (EUR) into the target currency.
   * If targetCurrency is omitted, converts into activeCurrency.
   */
  public convertFromEUR(amountEUR: number | undefined | null, targetCurrency: string = this.activeCurrency()): number {
    if (amountEUR == null || isNaN(amountEUR)) return 0;
    const rate = this.exchangeRates[targetCurrency] || 1.0;
    const val = amountEUR * rate;
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Convert an amount from source currency back into base currency (EUR).
   */
  public convertToEUR(amount: number | undefined | null, sourceCurrency: string = this.activeCurrency()): number {
    if (amount == null || isNaN(amount)) return 0;
    const rate = this.exchangeRates[sourceCurrency] || 1.0;
    const val = amount / rate;
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Convert transaction amount HT based on subscription plan tier or exchange rate
   */
  public convertTransactionAmountHt(t: { subscriptionPlan?: string; amountHt?: number; amountPaid?: number; vatRate?: number }, targetCurrency: string = this.activeCurrency()): number {
    const plan = (t.subscriptionPlan || '').toUpperCase();
    const vatRate = t.vatRate != null ? t.vatRate : 20.0;
    const vatFactor = 1 + vatRate / 100;

    if (plan === 'STANDARD' || plan === 'PREMIUM') {
      const found = this.supportedCurrencies.find(c => c.code === targetCurrency);
      const prices = found ? { standard: found.standardPrice, premium: found.premiumPrice } : { standard: 299.00, premium: 599.00 };
      const ttcPrice = plan === 'STANDARD' ? prices.standard : prices.premium;
      return ttcPrice / vatFactor;
    }

    const rawHt = t.amountHt != null ? t.amountHt : (t.amountPaid ? t.amountPaid / vatFactor : 0);
    return this.convertFromEUR(rawHt, targetCurrency);
  }

  /**
   * Convert transaction amount TTC based on subscription plan tier or exchange rate
   */
  public convertTransactionAmountTtc(t: { subscriptionPlan?: string; amountPaid?: number }, targetCurrency: string = this.activeCurrency()): number {
    const plan = (t.subscriptionPlan || '').toUpperCase();
    if (plan === 'STANDARD' || plan === 'PREMIUM') {
      const found = this.supportedCurrencies.find(c => c.code === targetCurrency);
      const prices = found ? { standard: found.standardPrice, premium: found.premiumPrice } : { standard: 299.00, premium: 599.00 };
      return plan === 'STANDARD' ? prices.standard : prices.premium;
    }

    const rawTtc = t.amountPaid != null ? t.amountPaid : 0;
    return this.convertFromEUR(rawTtc, targetCurrency);
  }

  /**
   * Helper method to convert & format an amount from EUR to the active currency.
   * Example: convertAndFormat(25) -> "270.00 DH" (if activeCurrency is MAD)
   */
  public convertAndFormat(amountEUR: number | undefined | null, targetCurrency: string = this.activeCurrency()): string {
    const converted = this.convertFromEUR(amountEUR, targetCurrency);
    return this.formatAmount(converted, targetCurrency);
  }

  /**
   * Format amount with currency symbol
   */
  public formatAmount(amount: number, code: string = this.activeCurrency()): string {
    const formatted = amount.toFixed(2);
    const symbol = this.getSymbol(code);
    if (code === 'MAD') return `${formatted} DH`;
    if (code === 'GBP') return `£${formatted}`;
    if (code === 'USD' || code === 'CAD') return `${formatted} $`;
    return `${formatted} ${symbol}`;
  }

  private isValidCurrency(code: string): boolean {
    return this.supportedCurrencies.some(c => c.code === code);
  }

  private mapCountryToCurrency(countryCode: string): string {
    const euCountries = [
      'FR', 'DE', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'IE', 'GR', 
      'FI', 'LU', 'SE', 'DK', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 
      'HR', 'SI', 'EE', 'LV', 'LT', 'CY', 'MT'
    ];

    if (countryCode === 'MA') return 'MAD';
    if (countryCode === 'CA') return 'CAD';
    if (countryCode === 'GB') return 'GBP';
    if (countryCode === 'CH') return 'CHF';
    if (countryCode === 'US' || countryCode === 'PR' || countryCode === 'GU') return 'USD';
    if (euCountries.includes(countryCode)) return 'EUR';

    // Default to MAD for local development/testing when country is unrecognized/local
    return 'MAD';
  }

  private detectFromBrowserLocale(): string {
    try {
      const language = (navigator.language || 'fr-MA').toLowerCase();
      const timeZone = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
      
      if (language.includes('ma') || timeZone.includes('casablanca')) return 'MAD';
      if (language.includes('ca') || timeZone.includes('toronto') || timeZone.includes('vancouver')) return 'CAD';
      if (language.includes('gb') || timeZone.includes('london')) return 'GBP';
      if (language.includes('us') || timeZone.includes('york') || timeZone.includes('los_angeles')) return 'USD';
      if (language.includes('ch') || timeZone.includes('zurich')) return 'CHF';
      if (language.includes('fr') || language.includes('de') || language.includes('es') || language.includes('it')) return 'EUR';
    } catch (e) {
      console.warn('Locale check failed:', e);
    }
    // Default to MAD for local development/testing
    return 'MAD';
  }
}
