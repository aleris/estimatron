import './index.scss'

(function () {
    const win = window
    const doc = document.documentElement

    doc.classList.remove('no-js')
    doc.classList.add('js')


    // Moving objects
    const movingObjects = document.querySelectorAll('.is-moving-object')

    // Throttling
    function throttle (func: (e: MouseEvent) => void, milliseconds: number) {
        let lastEventTimestamp: number | null = null
        let limit = milliseconds

        return (...args: any) => {
            let now = Date.now()

            if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
                lastEventTimestamp = now
                func.apply(this, args)
            }
        }
    }

    // Init vars
    let mouseX = 0
    let mouseY = 0
    let scrollY = 0
    let coordinateX = 0
    let coordinateY = 0
    let winW = doc.clientWidth
    let winH = doc.clientHeight

    // Move Objects
    function moveObjects (e: MouseEvent, object: any) {
        mouseX = e.pageX
        mouseY = e.pageY
        scrollY = win.scrollY
        coordinateX = (winW / 2) - mouseX
        coordinateY = (winH / 2) - (mouseY - scrollY)

        for (let i = 0; i < object.length; i++) {
            const translatingFactor = object[i].getAttribute('data-translating-factor') || 20
            const rotatingFactor = object[i].getAttribute('data-rotating-factor') || 20
            const perspective = object[i].getAttribute('data-perspective') || 500
            let tranformProperty = []

            if (object[i].classList.contains('is-translating')) {
                tranformProperty.push('translate(' + coordinateX / translatingFactor + 'px, ' + coordinateY / translatingFactor + 'px)')
            }

            if (object[i].classList.contains('is-rotating')) {
                tranformProperty.push('perspective(' + perspective + 'px) rotateY(' + -coordinateX / rotatingFactor + 'deg) rotateX(' + coordinateY / rotatingFactor + 'deg)')
            }

            if (object[i].classList.contains('is-translating') || object[i].classList.contains('is-rotating')) {
                object[i].style.transform = tranformProperty.join(' ')
                object[i].style.transition = 'transform 1s ease-out'
                object[i].style.transformStyle = 'preserve-3d'
                object[i].style.backfaceVisibility = 'hidden'
            }
        }
    }

    // Call function with throttling
    if (movingObjects) {
        win.addEventListener('mousemove', throttle(
            (e: MouseEvent) => {
                moveObjects(e, movingObjects)
            },
            150
        ))
    }
}())
