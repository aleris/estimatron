export class NameGenerator {
    public static randomReadableName(length: number = 5): string {
        const vocals = 'aeiou'
        const consonants = 'bcdfghjklmnpqrstvxyz'
        let c = Math.floor(Math.random() * 2)
        let r = ''
        let prev = ''
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
            r += i === 0 ? current.toUpperCase() : current
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
