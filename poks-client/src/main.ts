import './style/main.scss'
import { TableController } from '@/TableController'

window.addEventListener('DOMContentLoaded', async () => {

    const tableController = new TableController('tableCanvas')

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
})
