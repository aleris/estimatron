export abstract class OptionsDialog<T> {
    public onClose: (options: T | null) => void = () => {}

    protected addBaseListeners() {
        this.closeButton?.addEventListener('click', (event: Event) => {
            this.cancel()
        })

        this.applyButton?.addEventListener('click', (event: Event) => {
            this.apply()
        })

        this.dialogElement?.addEventListener('keydown', (event: KeyboardEvent) => {
            event.stopPropagation()
            switch (event.key) {
                case 'Escape':
                case 'Esc':
                    this.cancel()
                    return
            }
        })
    }

    isOpen() {
        return !this.dialogElement?.classList.contains('outside')
    }

    open() {
        const dialogElement = this.dialogElement
        if (dialogElement === null) {
            return
        }
        dialogElement.classList.remove('outside')
        setTimeout(() => {
            const inputs = dialogElement.getElementsByTagName('input')
            if (inputs !== undefined) {
                const first = inputs.item(0)
                if (first !== null) {
                    first.focus()
                }
            }
        }, 200)
    }

    close() {
        const dialogElement = this.dialogElement
        if (dialogElement === null) {
            return
        }
        dialogElement.classList.add('outside')
    }

    abstract update(options: T): void

    protected abstract get dialogElement(): HTMLElement | null
    protected abstract get closeButton(): HTMLElement | null
    protected abstract get applyButton(): HTMLElement | null

    protected abstract getData(): T

    private cancel() {
        this.close()
        this.onClose(null)
    }

    private apply() {
        this.close()
        this.onClose(this.getData())
    }
}
