import './style/main.scss'
import { TableController } from '@/TableController'
import { TableOptionsDialogController } from '@/dialogs/table-options/TableOptionsDialogController'

window.addEventListener('DOMContentLoaded', async () => {

    const tableController = new TableController('tableCanvas')

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
})
