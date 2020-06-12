import { id } from './id'

export class ChangePlayerOptionsNotificationData {
    constructor(
        public readonly playerId: id,
        public readonly playerName: string,
        public readonly observerMode: boolean
    ) { }
}
