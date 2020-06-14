export enum JoinDeniedReasons {
    MaxPlayersOnATable
}

export class JoinDeniedNotificationData {
    constructor(public readonly reason: JoinDeniedReasons) { }
}
