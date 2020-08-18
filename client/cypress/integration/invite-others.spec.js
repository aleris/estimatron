import { CanvasPositions } from "./canvas-positions"

function clickInviteOthersButton() {
    cy.get('#tableCanvas').click(CanvasPositions.InviteOthersButton.x, CanvasPositions.InviteOthersButton.y)
}

describe('Invite Others', () => {
    beforeEach(() => {
        cy.visit('/app.html')
    })

    specify('invite others dialog initially is not visible', () => {
        cy.get('#inviteOthersDialog').should('not.be.visible')
    })

    specify('click invite others button opens the invite others dialog', () => {
        clickInviteOthersButton()
        cy.get('#inviteOthersDialog').should('be.visible')
        cy.get('#inviteOthersDialog--url').should('have.focus')
    })

    specify('dialog close button closes the dialog', () => {
        clickInviteOthersButton()
        cy.get('#inviteOthersDialog').should('be.visible')
        cy.get('#inviteOthersDialog--closeButton').click()
        cy.get('#inviteOthersDialog').should('not.be.visible')
    })

    specify('esc closes the dialog', () => {
        clickInviteOthersButton()
        cy.get('#inviteOthersDialog').should('be.visible')
        cy.get('#inviteOthersDialog').trigger('keydown', { key: 'Escape' })
        cy.get('#inviteOthersDialog').should('not.be.visible')
    })

    specify('url input contains window url', () => {
        clickInviteOthersButton()
        cy.get('#inviteOthersDialog').should('be.visible')
        cy.get('#inviteOthersDialog--url').then(($input) => {
            cy.window().then($window => {
                expect($input.val()).to.equal($window.location.href)
            })
        })
    })

    // specify('copy button click copies url from input to clipboard', () => {
    //     clickInviteOthersButton()
    //     cy.get('#inviteOthersDialog').should('be.visible')
    //     cy.get('#inviteOthersDialog--copyButton').click()
    //     cy.get('#inviteOthersDialog--url').then(($input) => {
    //         cy.window().then($window => {
    //             expect($window.clipboardData.getData('Text')).to.equal($input.val())
    //         })
    //     })
    // })

    specify('close button from footer closes dialog', () => {
        clickInviteOthersButton()
        cy.get('#inviteOthersDialog').should('be.visible')
        cy.get('#inviteOthersDialog--applyButton').click()
        cy.get('#inviteOthersDialog').should('not.be.visible')
    })
})
