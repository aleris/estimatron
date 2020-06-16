import { id } from './id'
import { Table } from '../server/Table'
import { Player } from '../server/Player'

export interface TablePlayerIds {
    tableId: id
    playerId: id
}

export interface TablePlayer {
    table: Table
    player: Player
}
