import { StorageRepository } from './StorageRepository'
import { NameGenerator } from './NameGenerator'
import { BetBuilder } from './Bet'
import { IdGenerator } from './IdGenerator'

export class SessionPlayer {
    get() {
        let player = StorageRepository.player.get()
        if (null === player) {
            player = {
                id: IdGenerator.randomUniqueId(),
                name: NameGenerator.randomReadableName(),
                bet: BetBuilder.noBet()
            }
            StorageRepository.player.set(player)
        }
        return player
    }
}
