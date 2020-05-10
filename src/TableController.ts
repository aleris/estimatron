import { Player, SessionPlayer } from './Player'
import { SessionTable, Table } from './Table'

export class TableController {
    player: Player
    table: Table

    constructor(
        private readonly sessionTable: SessionTable,
        private readonly sessionPlayer: SessionPlayer
    ) { }

    async init() {
        this.player = this.sessionPlayer.get()
        console.log('player', this.player)
        this.table = await this.sessionTable.getOrCreate(this.player)
        console.log('table', this.table)
    }
}
