import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;
  readonly addBackpackButton: Locator;
  readonly removeBackpackButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.addBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.removeBackpackButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
  }

  /**
   * Navigates directly to the inventory page
   */
  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/inventory.html');
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
   * Clicks 'Remove' on Sauce Labs Backpack
   */
  async removeBackpackFromCart(): Promise<void> {
    await this.removeBackpackButton.click();
  }

  /**
   * Returns current count text displayed on cart badge
   */
  async getCartCount(): Promise<string> {
    return (await this.shoppingCartBadge.textContent()) || '0';
  }
}
