import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { CurrencyUtil } from '../utils/currency.util';

export class InventoryPage extends BasePage {
  readonly titleHeader: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly addBackpackButton: Locator;
  readonly removeBackpackButton: Locator;
  readonly addBikeLightButton: Locator;
  readonly addBoltTShirtButton: Locator;
  readonly sortDropdown: Locator;
  readonly activeSortOption: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly hamburgerMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly twitterLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedinLink: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('[data-test="title"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.shoppingCartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.addBackpackButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
    this.removeBackpackButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
    this.addBikeLightButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
    this.addBoltTShirtButton = page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.activeSortOption = page.locator('[data-test="active-option"]');
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.hamburgerMenuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.allItemsLink = page.locator('[data-test="inventory-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.twitterLink = page.locator('[data-test="social-x"]');
    this.facebookLink = page.locator('[data-test="social-facebook"]');
    this.linkedinLink = page.locator('[data-test="social-linkedin"]');
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
   * Adds multiple items to the cart
   */
  async addMultipleItemsToCart(): Promise<void> {
    await this.addBackpackButton.click();
    await this.addBikeLightButton.click();
    await this.addBoltTShirtButton.click();
  }

  /**
   * Clicks the shopping cart container to open cart
   */
  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  /**
   * Returns current count text displayed on cart badge
   */
  async getCartCount(): Promise<string> {
    return (await this.shoppingCartBadge.textContent()) || '0';
  }

  /**
   * Selects sorting option from dropdown: 'az', 'za', 'lohi', 'hilo'
   */
  async selectSort(optionValue: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(optionValue);
  }

  /**
   * Returns current active sorting label text (e.g., 'Name (A to Z)')
   */
  async getActiveSortText(): Promise<string> {
    return (await this.activeSortOption.textContent()) || '';
  }

  /**
   * Extracts all product names currently displayed in inventory
   */
  async getAllProductNames(): Promise<string[]> {
    return await this.itemNames.allTextContents();
  }

  /**
   * Extracts all product prices in integer cents
   */
  async getAllProductPricesInCents(): Promise<number[]> {
    const rawPrices = await this.itemPrices.allTextContents();
    return rawPrices.map(p => CurrencyUtil.parseToCents(p));
  }

  /**
   * Opens the sidebar drawer navigation menu
   */
  async openMenu(): Promise<void> {
    await this.hamburgerMenuButton.click();
    await this.closeMenuButton.waitFor({ state: 'visible' });
  }

  /**
   * Closes the sidebar drawer navigation menu
   */
  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await this.closeMenuButton.waitFor({ state: 'hidden' });
  }

  /**
   * Resets application state from the drawer menu
   */
  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetAppStateLink.click();
    await this.closeMenu();
  }

  /**
   * Logs out from the sidebar drawer menu
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
