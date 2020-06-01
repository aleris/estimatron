export enum Messages {
    Join,
    JoinConfirmedNotification,
    OtherJoinedNotification,

    Bet,
    OtherBetNotification,

    Leave,
    OtherLeftNotification,

    RevealBets,
    RevealBetsNotification,

    ResetTable,
    ResetTableNotification
}

export interface MessageInfo {
    kind: Messages
}

export interface MessageData<T> extends MessageInfo {
    data: T
}
