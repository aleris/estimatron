import { id } from './id'
import { Table } from '../Table'
import { Player } from '../Player'

export interface TablePlayerIds {
    tableId: id
    playerId: id
}

export interface TablePlayer {
    table: Table
    player: Player
}
