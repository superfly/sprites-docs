import './commands';

Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver errors (common in UI libraries)
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  // Ignore React hydration errors (can happen in development)
  if (
    err.message.includes('Hydration') ||
    err.message.includes('hydrat') ||
    err.message.includes('Text content does not match')
  ) {
    return false;
  }
  return true;
});
