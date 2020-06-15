export enum JoinDeniedReasons {
    MaxPlayersOnATable
}

export interface JoinDeniedNotificationData {
    reason: JoinDeniedReasons
}

export const JoinDeniedReasonMessages = {
    [JoinDeniedReasons.MaxPlayersOnATable]: 'You cannot join this table, maximum number of players on a table have been reached.'
}
