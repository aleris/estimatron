import { PlayerInfo } from './PlayerInfo'

export interface RevealBetsNotificationData {
    revealedBy: PlayerInfo,
    players: PlayerInfo[]
}
