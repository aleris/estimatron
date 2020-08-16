import { SessionTable } from '@/app/data/SessionTable'
import { OptionsDialog } from '@/app/hud-components/OptionsDialog'

export class InviteOthersDialogController extends OptionsDialog<string> {
    protected readonly dialogElement: HTMLElement | null
    protected readonly closeButton: HTMLElement | null
    protected readonly applyButton: HTMLElement | null
    private readonly copyButton: HTMLElement | null
    private readonly inviteOthersDialogURL: HTMLInputElement | null

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.dialogElement = document.getElementById('inviteOthersDialog')
        this.closeButton = document.getElementById('inviteOthersDialog--closeButton')
        this.applyButton = document.getElementById('inviteOthersDialog--applyButton')
        this.copyButton = document.getElementById('inviteOthersDialog--copyButton')
        this.inviteOthersDialogURL = document.getElementById('inviteOthersDialog--url') as HTMLInputElement

        this.addBaseListeners()

        this.copyButton?.addEventListener('click', (event: Event) => {
            this.inviteOthersDialogURL?.select()
            document.execCommand('copy')
        })
    }

    update(url: string) {
        if (null !== this.inviteOthersDialogURL) {
            this.inviteOthersDialogURL.value = url
            this.inviteOthersDialogURL.select()
        }
    }

    protected getData() {
        return this.inviteOthersDialogURL?.value || ''
    }
}
