export enum JoinDeniedReasons {
    MaxTables,
    MaxPlayersOnATable
}

export interface JoinDeniedNotificationData {
    reason: JoinDeniedReasons
}

export const JoinDeniedReasonMessages = {
    [JoinDeniedReasons.MaxPlayersOnATable]: 'Sorry, table cannot be joined, maximum number of players on a table has been reached.',
    [JoinDeniedReasons.MaxTables]: 'Sorry, cannot create table, maximum tables that can be hosted has been reached.'
}
