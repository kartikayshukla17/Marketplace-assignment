export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum ListingStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED'
}

export enum OrderStatus {
    REQUESTED = 'REQUESTED',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum ListingType {
    FIXED = 'FIXED',
    QUOTE = 'QUOTE'
}

export enum ActivityType {
    ORDER_CREATED = 'ORDER_CREATED',
    ORDER_ACCEPTED = 'ORDER_ACCEPTED',
    ORDER_REJECTED = 'ORDER_REJECTED',
    ORDER_COMPLETED = 'ORDER_COMPLETED',
    QUOTE_PROVIDED = 'QUOTE_PROVIDED'
}
