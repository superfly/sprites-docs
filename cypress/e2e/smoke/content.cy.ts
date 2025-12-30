describe('Content Rendering', () => {
  it('should render markdown content on homepage', () => {
    cy.visit('/');
    cy.get('main').should('be.visible');
    cy.get('h1, h2, p').should('have.length.greaterThan', 0);
  });

  it('should render code blocks on quickstart page', () => {
    cy.visit('/quickstart');
    cy.get('pre code, .astro-code').should('have.length.greaterThan', 0);
  });

  it('should render links correctly', () => {
    cy.visit('/');
    cy.get('a[href]').should('have.length.greaterThan', 0);
  });

  it('should load documentation pages without errors', () => {
    const pages = ['/', '/quickstart'];

    pages.forEach((page) => {
      cy.visit(page);
      cy.get('main').should('be.visible');
    });
  });
});
