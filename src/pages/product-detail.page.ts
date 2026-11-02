import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  readonly backToProductsButton: Locator;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
    this.productName = page.locator('[data-test="inventory-item-name"]');
    this.productDescription = page.locator('[data-test="inventory-item-desc"]');
    this.productPrice = page.locator('[data-test="inventory-item-price"]');
    this.addToCartButton = page.locator('[data-test^="add-to-cart"]');
    this.removeButton = page.locator('[data-test^="remove"]');
  }

  /**
   * Returns the product name text
   */
  async getName(): Promise<string> {
    return (await this.productName.textContent()) || '';
  }

  /**
   * Returns the product price as a number (strips $ prefix)
   */
  async getPriceAsNumber(): Promise<number> {
    const priceText = (await this.productPrice.textContent()) || '$0.00';
    return parseFloat(priceText.replace('$', ''));
  }

  /**
   * Adds the product to the cart
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /**
   * Navigates back to the inventory (product list) page
   */
  async goBackToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
