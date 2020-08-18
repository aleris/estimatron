export enum Messages {
    Join,
    JoinConfirmedNotification,
    OtherJoinedNotification,
    JoinDeniedNotification,

    Bet,
    OtherBetNotification,

    Leave,
    OtherLeftNotification,

    RevealBets,
    RevealBetsNotification,

    ResetTable,
    ResetTableNotification,

    ChangeTableOptions,
    ChangeTableOptionsNotification,

    ChangePlayerOptions,
    ChangePlayerOptionsNotification
}

export interface MessageInfo {
    kind: Messages
}

export interface MessageData<T> extends MessageInfo {
    data: T
}
