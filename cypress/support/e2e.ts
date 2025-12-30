import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors (common in UI libraries)
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});
