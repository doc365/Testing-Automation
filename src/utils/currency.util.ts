/**
 * Currency utility to prevent IEEE-754 floating-point arithmetic errors
 * in e-commerce price and tax calculations.
 */
export class CurrencyUtil {
  private static readonly TAX_RATE = 0.08; // SauceDemo standard 8% tax rate

  /**
   * Converts a formatted price string (e.g., "$29.99" or "Item total: $29.99") into integer cents.
   */
  static parseToCents(priceText: string): number {
    const match = priceText.match(/[\d,.]+/);
    if (!match) {
      return 0;
    }
    const cleanNumber = parseFloat(match[0].replace(/,/g, ''));
    return Math.round(cleanNumber * 100);
  }

  /**
   * Converts integer cents back into a dollar number (e.g., 2999 -> 29.99).
   */
  static centsToDollars(cents: number): number {
    return cents / 100;
  }

  /**
   * Formats cents into a currency display string (e.g., 2999 -> "$29.99").
   */
  static formatCents(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  /**
   * Calculates the exact tax in cents based on the 8% standard rate.
   * SauceDemo uses standard commercial rounding (half up).
   */
  static calculateTaxInCents(subtotalCents: number): number {
    return Math.round(subtotalCents * this.TAX_RATE);
  }

  /**
   * Computes the total price in cents: Subtotal + Tax.
   */
  static calculateTotalInCents(subtotalCents: number): number {
    const taxCents = this.calculateTaxInCents(subtotalCents);
    return subtotalCents + taxCents;
  }
}
