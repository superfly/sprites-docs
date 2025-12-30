describe('Theme Toggle', () => {
  beforeEach(() => {
    // Clear theme preference before each test
    cy.clearLocalStorage('starlight-theme');
    cy.visit('/');
    // Wait for React hydration
    cy.wait(500);
  });

  it('should have a theme toggle button', () => {
    // The theme switcher button has sr-only text "Toggle theme"
    cy.get('button')
      .contains('Toggle theme', { matchCase: false })
      .should('exist');
  });

  it('should open theme dropdown when clicked', () => {
    cy.get('button')
      .filter(':has(svg)')
      .filter(
        (_, el) =>
          el.textContent?.includes('Toggle theme') ||
          el.getAttribute('aria-label')?.includes('theme'),
      )
      .first()
      .click();
    // Dropdown should appear with Light, Dark, System options
    cy.contains('Light').should('be.visible');
    cy.contains('Dark').should('be.visible');
    cy.contains('System').should('be.visible');
  });

  it('should switch to light theme', () => {
    // Open dropdown
    cy.get('button')
      .filter(':has(svg)')
      .filter(
        (_, el) =>
          el.textContent?.includes('Toggle theme') ||
          el.getAttribute('aria-label')?.includes('theme'),
      )
      .first()
      .click();
    // Click Light option
    cy.contains('Light').click();
    // Check that data-theme is set to light
    cy.get('html').should('have.attr', 'data-theme', 'light');
  });

  it('should switch to dark theme', () => {
    // Open dropdown
    cy.get('button')
      .filter(':has(svg)')
      .filter(
        (_, el) =>
          el.textContent?.includes('Toggle theme') ||
          el.getAttribute('aria-label')?.includes('theme'),
      )
      .first()
      .click();
    // Click Dark option
    cy.contains('Dark').click();
    // Check that data-theme is set to dark
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });

  it('should persist theme preference in localStorage', () => {
    // Open dropdown and select Light
    cy.get('button')
      .filter(':has(svg)')
      .filter(
        (_, el) =>
          el.textContent?.includes('Toggle theme') ||
          el.getAttribute('aria-label')?.includes('theme'),
      )
      .first()
      .click();
    cy.contains('Light').click();

    // Check localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('starlight-theme')).to.eq('light');
    });
  });

  it('should maintain theme preference after page reload', () => {
    // Set theme to light
    cy.get('button')
      .filter(':has(svg)')
      .filter(
        (_, el) =>
          el.textContent?.includes('Toggle theme') ||
          el.getAttribute('aria-label')?.includes('theme'),
      )
      .first()
      .click();
    cy.contains('Light').click();
    cy.get('html').should('have.attr', 'data-theme', 'light');

    // Reload page
    cy.reload();
    cy.wait(500);

    // Theme should still be light
    cy.get('html').should('have.attr', 'data-theme', 'light');
  });
});
