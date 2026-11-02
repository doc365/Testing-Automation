import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CheckoutInfoPage extends BasePage {
  readonly titleHeader: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.titleHeader = page.locator('[data-test="title"]');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com/checkout-step-one.html');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    if (firstName) {
      await this.firstNameInput.fill(firstName);
    } else {
      await this.firstNameInput.clear();
    }

    if (lastName) {
      await this.lastNameInput.fill(lastName);
    } else {
      await this.lastNameInput.clear();
    }

    if (postalCode) {
      await this.postalCodeInput.fill(postalCode);
    } else {
      await this.postalCodeInput.clear();
    }
  }

  async submitContinue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancelCheckout(): Promise<void> {
    await this.cancelButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }
}
