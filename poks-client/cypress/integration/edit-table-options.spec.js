describe('Table Options', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    specify('table options dialog initially is not visible', () => {
        cy.get('#tableOptionsDialog').should('not.be.visible')
    })

    specify('click table options button opens the table options dialog', () => {
        cy.get('#tableOptionsPanel--optionsButton').click()
        cy.get('#tableOptionsDialog').should('be.visible')
        cy.get('#tableOptionsDialog--tableName').should('have.focus')
    })

    specify('dialog close button closes the dialog', () => {
        cy.get('#tableOptionsPanel--optionsButton').click()
        cy.get('#tableOptionsDialog--closeButton').click()
        cy.get('#tableOptionsDialog').should('not.be.visible')
    })

    specify('table name input contains same text as panel table name', () => {
        cy.get('#tableOptionsPanel--optionsButton').click()
        cy.get('#tableOptionsDialog--tableName').then(($input) => {
            const val = $input.val()
            cy.get('#tableOptionsPanel--tableName').then(($text) => {
                const text = $text.text()
                expect(val).to.equal(text)
            })
        })
    })

    specify('when modifying table name and click apply it modifies panel table name', () => {
        cy.get('#tableOptionsPanel--optionsButton').click()
        cy.get('#tableOptionsDialog--tableName').clear()
        cy.get('#tableOptionsDialog--tableName').type('Modified Name')
        cy.get('#tableOptionsDialog--applyButton').click()
        cy.get('#tableOptionsPanel--tableName').should('have.text', 'Modified Name')
    })

    specify('apply without any modification closes dialog', () => {
        cy.get('#tableOptionsPanel--optionsButton').click()
        cy.get('#tableOptionsDialog--applyButton').click()
        cy.get('#tableOptionsDialog').should('not.be.visible')
    })
})
