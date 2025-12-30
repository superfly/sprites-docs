describe('Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have a visible search trigger', () => {
    cy.get('.search-trigger').should('exist').and('be.visible');
  });

  it('should have correct search trigger attributes', () => {
    cy.get('.search-trigger').should('have.attr', 'data-open-modal');
    cy.get('.search-trigger').should('have.attr', 'aria-label', 'Search');
  });

  it('should show keyboard shortcut hint', () => {
    cy.get('.search-trigger .search-kbd').should('exist');
  });
});
