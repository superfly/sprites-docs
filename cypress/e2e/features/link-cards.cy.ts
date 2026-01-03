describe('LinkCards', () => {
  beforeEach(() => {
    cy.visit('/quickstart');
  });

  it('should render cards with icon, title, and description', () => {
    cy.get('.grid a.no-underline')
      .first()
      .within(() => {
        cy.get('svg').should('exist');
        cy.get('h3').should('exist').and('not.be.empty');
        cy.get('p').should('exist').and('not.be.empty');
      });
  });

  it('should navigate to linked page when clicked', () => {
    cy.get('.grid a.no-underline')
      .first()
      .then(($link) => {
        const href = $link.attr('href');
        cy.wrap($link).click();
        cy.url().should('include', href);
      });
  });
});
