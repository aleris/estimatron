import { Shape } from '@createjs/easeljs'

export enum GuideLineOrientation {
    Horizontal,
    Vertical
}

export class DebugGuideLine extends Shape {
    constructor(xy: number, orientation = GuideLineOrientation.Horizontal) {
        super()
        if (orientation === GuideLineOrientation.Horizontal) {
            this.graphics
                .beginStroke('red')
                .moveTo(-2000, xy)
                .lineTo(4000, xy)
                .endStroke()
        } else {
            this.graphics
                .beginStroke('red')
                .moveTo(xy, -2000)
                .lineTo(xy, 4000)
                .endStroke()
        }
    }
}
