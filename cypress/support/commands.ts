/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      verifyPageLoaded(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('verifyPageLoaded', () => {
  cy.get('main').should('be.visible');
});

export {};
