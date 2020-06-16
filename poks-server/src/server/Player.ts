import { WebSocket } from 'uWebSockets.js'
import { PlayerInfo, PlayerInfoHelper } from '../model/PlayerInfo'

export interface Player {
    ws: WebSocket
    playerInfo: PlayerInfo
}

export class PlayerHelper {
    static nameAndId(player: Player) {
        return PlayerInfoHelper.nameAndId(player.playerInfo)
    }
}
