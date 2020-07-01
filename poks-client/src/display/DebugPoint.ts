import { Shape } from '@/createjs'

export class DebugPoint extends Shape {
    constructor(x: number, y: number) {
        super()
        const d = 20
        const r = 5
        this.graphics
            .beginStroke('red')
            .moveTo(x, y - d)
            .lineTo(x, y + d)
            .moveTo(x - d, y)
            .lineTo(x + d, y)
            .drawCircle(x, y, r)
            .endStroke()
    }
}
