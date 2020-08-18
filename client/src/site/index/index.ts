import './index.scss'
import './movingObjects'
import { LocalStorageRepository } from '@/app/data/StorageRepository'
import { TableInfo } from '@server/model/TableInfo'

window.addEventListener('DOMContentLoaded', async () => {
    const existingTable: TableInfo | undefined = LocalStorageRepository.table.getAll()?.values().next().value
    if (existingTable) {
        const startButtonWrapper = document.getElementById('startButtonWrapper')
        const startContinueButtonWrapper = document.getElementById('startContinueButtonWrapper')
        const startNewButtonWrapper = document.getElementById('startNewButtonWrapper')

        startButtonWrapper?.classList.add('start-hide')
        startContinueButtonWrapper?.classList.remove('start-hide')
        startContinueButtonWrapper?.classList.add('start-show')
        startNewButtonWrapper?.classList.remove('start-hide')
        startNewButtonWrapper?.classList.add('start-show')

        const startContinueButton = document.getElementById('startContinueButton') as HTMLAnchorElement | undefined
        if (startContinueButton) {
            startContinueButton.hash = existingTable.id
        }
    }
})
