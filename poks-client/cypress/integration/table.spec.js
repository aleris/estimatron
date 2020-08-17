import { CanvasPositions } from "./canvas-positions"

describe('Table', () => {
    beforeEach(() => {
        cy.visit('/app.html')
    })

    specify('bla', () => {
        cy.get('#tableCanvas').should('be.visible')
        cy.get('#tableCanvas')
            .click(CanvasPositions.Card8.x, CanvasPositions.Card8.y)
    })
})
