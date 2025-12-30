describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to Quickstart page', () => {
    cy.contains('a', 'Quickstart').click();
    cy.url().should('include', '/quickstart');
    cy.get('main').should('be.visible');
  });

  it('should navigate between documentation pages', () => {
    cy.contains('a', 'Quickstart').click();
    cy.url().should('include', '/quickstart');

    cy.contains('a', 'Overview').click();
    cy.url().should('match', /\/$/);
  });

  it('should have working internal links', () => {
    cy.get('nav a[href]').first().click();
    cy.get('main').should('be.visible');
  });
});
