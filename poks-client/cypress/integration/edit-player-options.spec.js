describe('Player Options', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    specify('player options dialog initially is not visible', () => {
        cy.get('#playerOptionsDialog').should('not.be.visible')
    })

    specify('click player options button opens the player options dialog', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog--playerName').should('have.focus')
    })

    specify('dialog close button closes the dialog', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog--closeButton').click()
        cy.get('#playerOptionsDialog').should('not.be.visible')
    })

    specify('esc closes the dialog', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog').trigger('keydown', { key: 'Escape' })
        cy.get('#playerOptionsDialog').should('not.be.visible')
    })

    specify('player name input contains same text as panel player name', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog--playerName').then(($input) => {
            const val = $input.val()
            cy.get('#playerOptionsPanel--playerName').then(($text) => {
                const text = $text.text()
                expect(val).to.equal(text)
            })
        })
    })

    specify('when modifying player name and click apply it modifies panel player name', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog--playerName').clear()
        cy.get('#playerOptionsDialog--playerName').type('Modified Name')
        cy.get('#playerOptionsDialog--applyButton').click()
        cy.get('#playerOptionsPanel--playerName').should('have.text', 'Modified Name')
    })

    specify('apply without any modification closes dialog', () => {
        cy.get('#playerOptionsPanel--optionsButton').click()
        cy.get('#playerOptionsDialog').should('be.visible')
        cy.get('#playerOptionsDialog--applyButton').click()
        cy.get('#playerOptionsDialog').should('not.be.visible')
    })
})
