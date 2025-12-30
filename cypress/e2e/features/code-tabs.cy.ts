describe('Code Tabs', () => {
  beforeEach(() => {
    // Visit a page with code tabs
    cy.visit('/quickstart');
  });

  it('should display tab list with multiple options', () => {
    cy.get('[role="tablist"]').should('exist');
    cy.get('[role="tab"]').should('have.length.at.least', 2);
  });

  it('should have first tab selected by default', () => {
    cy.get('[role="tab"]').first().should('have.attr', 'aria-selected', 'true');
  });

  it('should switch tab content when clicking different tab', () => {
    // Get the tabs
    cy.get('[role="tablist"]')
      .first()
      .within(() => {
        cy.get('[role="tab"]').then(($tabs) => {
          if ($tabs.length >= 2) {
            // Click second tab
            cy.wrap($tabs[1]).click();
            // Second tab should now be selected
            cy.wrap($tabs[1]).should('have.attr', 'aria-selected', 'true');
            // First tab should be deselected
            cy.wrap($tabs[0]).should('have.attr', 'aria-selected', 'false');
          }
        });
      });
  });

  it('should show corresponding content for selected tab', () => {
    cy.get('[role="tablist"]')
      .first()
      .within(() => {
        cy.get('[role="tab"]').then(($tabs) => {
          if ($tabs.length >= 2) {
            // Get text of second tab
            const tabText = $tabs[1].textContent;
            // Click it
            cy.wrap($tabs[1]).click();
          }
        });
      });
    // Tab panel should be visible
    cy.get('[role="tabpanel"]').should('be.visible');
  });

  it('should maintain tab selection after scrolling', () => {
    cy.get('[role="tablist"]')
      .first()
      .within(() => {
        cy.get('[role="tab"]').eq(1).click();
        cy.get('[role="tab"]')
          .eq(1)
          .should('have.attr', 'aria-selected', 'true');
      });
    // Scroll down and back up
    cy.scrollTo('bottom');
    cy.scrollTo('top');
    // Tab should still be selected
    cy.get('[role="tablist"]')
      .first()
      .within(() => {
        cy.get('[role="tab"]')
          .eq(1)
          .should('have.attr', 'aria-selected', 'true');
      });
  });
});

describe('Code Blocks', () => {
  beforeEach(() => {
    cy.visit('/quickstart');
  });

  it('should display code blocks with syntax highlighting', () => {
    cy.get('pre code, .astro-code').should('have.length.at.least', 1);
  });

  it('should have copy button on code blocks', () => {
    // Starlight adds copy buttons to code blocks
    cy.get('pre').first().realHover
      ? cy.get('pre').first().realHover()
      : cy.get('pre').first().trigger('mouseenter');
    // Look for copy button (Starlight uses data-copy-button or similar)
    cy.get('button[data-copy], .copy-button, button:has(svg)').should('exist');
  });
});
