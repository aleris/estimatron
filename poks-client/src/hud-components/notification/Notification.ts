export class Notification {
    private readonly notificationList: HTMLElement | null

    constructor() {
        this.notificationList = document.getElementById('notification::list')
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
}
