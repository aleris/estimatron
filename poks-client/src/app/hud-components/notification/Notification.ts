export class Notification {
    private readonly notificationList: HTMLElement | null
    private readonly notificationPermanent: HTMLElement | null

    constructor() {
        this.notificationList = document.getElementById('notification--list')
        this.notificationPermanent = document.getElementById('notification--permanent')
    }

    add(message: string) {
        const li = document.createElement('li')
        const span = document.createElement('span')
        span.textContent = message
        const button = document.createElement('button')
        button.addEventListener('click', () => {
            this.notificationList?.removeChild(li)
        })
        const i = document.createElement('i')
        button.append(i)
        li.append(span, button)
        this.notificationList?.append(li)
        // setTimeout(() => {
        //     this.notificationList?.removeChild(li)
        // }, 5000)
    }

    permanent(message: string) {
        const notificationPermanent = this.notificationPermanent
        if (notificationPermanent !== null) {
            notificationPermanent.classList.remove('outside')
            const messageElement = notificationPermanent.getElementsByClassName('message').item(0)
            if (messageElement !== null) {
                messageElement.textContent = message
            }
        }
    }
}
