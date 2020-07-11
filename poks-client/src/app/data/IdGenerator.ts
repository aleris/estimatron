import { v4 } from 'uuid'
import { id } from '@server/model/id'

export class IdGenerator {
    static randomUniqueId(): id {
        return v4()
    }
}
