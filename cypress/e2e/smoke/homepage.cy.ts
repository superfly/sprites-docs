describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage successfully', () => {
    cy.title().should('contain', 'Sprites');
    cy.get('main').should('be.visible');
  });

  it('should display the header', () => {
    cy.get('header').should('be.visible');
  });

  it('should display sidebar navigation', () => {
    cy.get('nav').should('exist');
  });

  it('should have main content area', () => {
    cy.get('main').within(() => {
      cy.get('h1, h2').should('exist');
    });
  });
});
