describe('Home Page Tests', () => {
    beforeEach(() => {
      // Visit the home page of your app
      cy.visit('/');
    });
  
    it('should display the banners correctly', () => {
      // Check that the "RENT A HOME" banner is visible
      cy.get('img[alt="Banner"]').should('be.visible');
      cy.contains('Rental Homes for').should('be.visible');
      cy.contains('Explore Renting').should('be.visible');
  
      // Check that the "BUY A HOME" banner is visible
      cy.contains('Find, Buy and Own Your').should('be.visible');
      cy.contains('Explore Buying').should('be.visible');
    });
  
    });
  
