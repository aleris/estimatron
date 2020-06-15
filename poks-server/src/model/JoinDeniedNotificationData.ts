export enum JoinDeniedReasons {
    MaxPlayersOnATable
}

export interface JoinDeniedNotificationData {
    reason: JoinDeniedReasons
}
