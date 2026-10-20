import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;
  readonly addBackpackButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.addBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  }

  async getItemCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * Clicks 'Add to cart' on Sauce Labs Backpack
   */
  async addBackpackToCart(): Promise<void> {
    await this.addBackpackButton.click();
  }

  /**
   * Returns current count text displayed on cart badge
   */
  async getCartCount(): Promise<string> {
    return (await this.shoppingCartBadge.textContent()) || '0';
  }
}
