import { Text } from '@createjs/easeljs'

export class TextArc extends Text {
    constructor(text: string, font: string, color: string, public radius = 0) {
        super(text, font, color)
        this.textBaseline = 'center'
    }

    _drawTextLine(ctx: CanvasRenderingContext2D, text: string, y: number) {
        // const wordWidth = ctx.measureText(text).width;
        // const totAngle = 2 * Math.asin(wordWidth / ( 2 * this.radius ));
        ctx.save();
        // ctx.rotate(-1 * totAngle / 2);
        // ctx.rotate(-1 * (angle / text.length) / 2);
        let prevLetter = ''
        for (let i = 0; i < text.length; i++) {
            const prevLetterWidth = ctx.measureText(prevLetter).width;
            const letter = text[i]
            const letterWidth = ctx.measureText(letter).width;
            const angle = 2 * Math.asin((prevLetterWidth + letterWidth / 2) / ( 2 * this.radius ));
            ctx.rotate(angle);
            ctx.save();
            ctx.translate(0, -1 * this.radius);
            super._drawTextLine(ctx, letter, y);
            ctx.restore();
            prevLetter = letter
        }
        ctx.restore();
    }
}
