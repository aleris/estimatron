import { TableInfo } from './TableInfo'
import { PlayerInfo } from './PlayerInfo'

export interface JoinConfirmedNotificationData {
    tableInfo: TableInfo,
    players: PlayerInfo[]
}
