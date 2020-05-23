import { firestore } from 'firebase'
import { Player } from './Player'
import { NameGenerator } from './NameGenerator'
import { Table } from './Table'
import { IdGenerator } from './IdGenerator'

export class SessionTable {
    public table: Table

    constructor(
        // private readonly firestore: firestore.Firestore
    ) { }

    async init(player: Player) {
        let tableId: string
        if (window.location.hash) {
            tableId = window.location.hash.substring(1)
            // const documentSnapshot = await this.getRef(tableId).get()
            // if (documentSnapshot.exists) {
            //     table = (documentSnapshot).data() as Table
            // } else {
            this.table = await this.create(player)
            // }
        } else {
            this.table = await this.create(player)
        }
        console.log('table', this.table)
        this.addPlayerIfDoesNotExists(player)
        // await this.getRef(table.id).set(table)
        return this.table
    }

    findPlayerById(playerId: string): Player | undefined {
        return this.table.players.find(p => p.id === playerId)
    }

    addPlayerIfDoesNotExists(player: Player): boolean {
        if (!this.findPlayerById(player.id)) {
            this.table.players.push(player)
            return true
        }
        return false
    }

    private async create(player: Player): Promise<Table> {
        // const nameId = NameGenerator.randomUniqueId()
        // const firestoreId = this.firestore.collection('tables').doc().id
        // const id = nameId.toString(firestoreId)
        const table = {
            id: IdGenerator.randomUniqueId(),
            name: NameGenerator.randomReadableName(),
            players: [] as Player[],
            me: player
        }
        // await this.getRef(table.id).set(table)
        window.location.hash = table.id
        return table
    }

    // private getRef(id: string) {
    //     return this.firestore.collection('tables').doc(id)
    // }
}
