import { v4 } from 'uuid'

export class IdGenerator {
    static randomUniqueId(): string {
        return v4()
    }
}
