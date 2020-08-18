describe('Table Logo nav', () => {
    specify('click logo goes to home page', () => {
        cy.visit('/app.html')
        cy.get('#logo > a').click()
        cy.location().should(($location) => {
            expect($location.pathname).to.eq('/')
            expect($location.hash).to.eq('')
        })
    })
})
