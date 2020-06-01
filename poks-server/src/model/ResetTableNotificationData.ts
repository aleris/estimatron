import { PlayerInfo } from './PlayerInfo'

export interface ResetTableNotificationData {
    resetBy: PlayerInfo,
    players: PlayerInfo[]
}
