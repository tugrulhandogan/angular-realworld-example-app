/// <reference types="cypress" />

describe('Test log out', () => {

    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it('verify use can log out successfully', { retries: 2 }, () => {
        cy.contains('Settings').click()
        //cy.get("[class='btn btn-outline-danger']", { timeout: 10000 }).should('be.visible');
        cy.get("[class='btn btn-outline-danger']").click()
        cy.get('.navbar-nav').should('contain', 'Sign up')
    })
})