import * as uWS from 'uWebSockets.js'
import { PlayerInfo } from './model/PlayerInfo'

export interface Player {
    ws: uWS.WebSocket
    playerInfo: PlayerInfo
}
