import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CurrencyUtil } from '../utils/currency.util';

export class CheckoutOverviewPage extends BasePage {
  readonly titleHeader: Locator;
  readonly cartItems: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly itemPrices: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('[data-test="title"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.itemTotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator('[data-test="tax-label"]');
    this.totalLabel = page.locator('[data-test="total-label"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Sums all individual item prices visible on the overview page in cents.
   */
  async getItemPricesSumInCents(): Promise<number> {
    const prices = await this.itemPrices.allTextContents();
    return prices.reduce((acc, priceText) => acc + CurrencyUtil.parseToCents(priceText), 0);
  }

  /**
   * Extracts the displayed subtotal (Item total) in cents.
   */
  async getSubtotalInCents(): Promise<number> {
    const text = (await this.itemTotalLabel.textContent()) || '';
    return CurrencyUtil.parseToCents(text);
  }

  /**
   * Extracts the displayed tax in cents.
   */
  async getTaxInCents(): Promise<number> {
    const text = (await this.taxLabel.textContent()) || '';
    return CurrencyUtil.parseToCents(text);
  }

  /**
   * Extracts the displayed grand total in cents.
   */
  async getTotalInCents(): Promise<number> {
    const text = (await this.totalLabel.textContent()) || '';
    return CurrencyUtil.parseToCents(text);
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }

  async cancelOrder(): Promise<void> {
    await this.cancelButton.click();
  }
}
