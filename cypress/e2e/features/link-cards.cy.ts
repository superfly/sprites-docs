describe('LinkCards', () => {
  beforeEach(() => {
    cy.visit('/quickstart');
  });

  it('should render cards with icon, title, and description', () => {
    cy.get('.grid a.no-underline')
      .first()
      .within(() => {
        cy.get('svg').should('exist');
        cy.get('[data-slot="item-title"]').should('exist').and('not.be.empty');
        cy.get('[data-slot="item-description"]')
          .should('exist')
          .and('not.be.empty');
      });
  });

  it('should have valid navigation links', () => {
    cy.get('.grid a.no-underline')
      .first()
      .then(($link) => {
        const href = $link.attr('href');
        // Verify href exists and is an internal link
        expect(href).to.match(/^\//);
        // Verify linked page exists (returns 200)
        cy.request(href as string)
          .its('status')
          .should('eq', 200);
      });
  });
});
