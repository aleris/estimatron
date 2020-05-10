import { v4 as uuid } from 'uuid'

export class NameId {
    constructor(public readonly name: string, public readonly uuid: string) { }

    toString(suffix?: string) {
        if (suffix) {
            return `${this.name}-${this.uuid}-${suffix}`
        } else {
            return `${this.name}-${this.uuid}`
        }
    }
}

export class NameIdGenerator {
    static looksValid(id: string) {
        return 42 <= id.length
    }

    static generate(): NameId {
        const name = this.generateReadableName(5).toUpperCase()
        return new NameId(name, uuid())
    }

    private static generateReadableName(length: number): string {
        const vocals = 'aeiou'
        const consonants = 'bcdfghjlmnprstv'
        let c = Math.floor(Math.random() * 2)
        let r = ''
        let prev = '-'
        for (let i = 0; i !== length; i++) {
            let current
            if (c === 0) {
                current = this.pickOneCharAvoiding(consonants, prev)
                c = 1
            } else if (c === 1) {
                current = this.pickOneCharAvoiding(vocals, prev)
                c = Math.random() < 0.25 ? 2 : 0
            } else {
                current = this.pickOneCharAvoiding(vocals, prev)
                c = 0
            }
            r += current
            prev = current
        }
        return r
    }

    private static pickOneCharAvoiding(s: string, avoid: string): string {
        let pick
        do {
            pick = this.pickOneChar(s)
        } while (pick === avoid)
        return pick
    }

    private static pickOneChar(s: string): string {
        return s.substr(Math.floor(Math.random() * s.length), 1)
    }
}
