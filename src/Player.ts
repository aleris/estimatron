import { Vote, VoteBuilder } from './Vote'
import { LocalStorage } from './LocalStorage'
import { NameIdGenerator } from './NameIdGenerator'

export interface Player {
    id: string
    name: string
    vote: Vote
}

export class SessionPlayer {
    get() {
        let player = LocalStorage.player.get()
        if (null === player) {
            const id = NameIdGenerator.generate()
            player = {
                id: id.toString(),
                name: id.name,
                vote: new VoteBuilder().noVote().build()
            }
            LocalStorage.player.set(player)
        }
        return player
    }
}
