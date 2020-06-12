export abstract class OptionsDialog<T> {
    public onPlayerOptionsChanged: (options: T) => void = () => {}

    protected abstract get dialogElement(): HTMLElement | null

    abstract update(options: T): void

    toggleDialog() {
        if (this.isOpen()) {
            this.close()
        } else {
            this.open()
        }
    }

    isOpen() {
        return !this.dialogElement?.classList.contains('outside')
    }

    close() {
        this.dialogElement?.classList.add('outside')
    }

    open() {
        this.dialogElement?.classList.remove('outside')
    }
}
