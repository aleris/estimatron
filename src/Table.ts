import { Player } from './Player'
import { firestore } from 'firebase'
import { NameIdGenerator } from './NameIdGenerator'

export interface Table {
    id: string
    name: string
    players: Player[]
}

export class SessionTable {
    constructor(
        private readonly firestore: firestore.Firestore
    ) { }

    async getOrCreate(player: Player) {
        let table: Table
        let tableId: string
        if (window.location.hash) {
            tableId = window.location.hash.substring(1)
            const documentSnapshot = await this.getRef(tableId).get()
            if (documentSnapshot.exists) {
                table = (documentSnapshot).data() as Table
            } else {
                table = await this.create()
            }
        } else {
            table = await this.create()
        }
        console.log(table)
        if (!table.players.find(p => p.id === player.id)) {
            table.players.push(player)
        }
        await this.getRef(table.id).set(table)
        return table
    }

    private async create(): Promise<Table> {
        const nameId = NameIdGenerator.generate()
        const firestoreId = this.firestore.collection('tables').doc().id
        const id = nameId.toString(firestoreId)
        const table = {
            id,
            name: nameId.name,
            players: [] as Player[]
        }
        await this.getRef(table.id).set(table)
        window.location.hash = table.id
        return table
    }

    private getRef(id: string) {
        return this.firestore.collection('tables').doc(id)
    }
}
