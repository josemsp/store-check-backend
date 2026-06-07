export const DomainEventType = {
  DAILY_CLOSURE_CONFIRMED: 'DailyClosureConfirmed',
  INVENTORY_COUNT_CONFIRMED: 'InventoryCountConfirmed',
  INVITATION_ACCEPTED: 'InvitationAccepted',
  LOT_EXPIRING_SOON: 'LotExpiringSoon',
  LOW_STOCK_DETECTED: 'LowStockDetected',
  PURCHASE_CONFIRMED: 'PurchaseConfirmed',
  TRANSFER_RECEIVED: 'TransferReceived',
  TRANSFER_RECEIVED_WITH_DIFFERENCE: 'TransferReceivedWithDifference',
  TRANSFER_SENT: 'TransferSent',
  TRANSFORMATION_CONFIRMED: 'TransformationConfirmed',
} as const

export type DomainEventType =
  (typeof DomainEventType)[keyof typeof DomainEventType]

export interface DomainEvent<TPayload = unknown> {
  id: string
  organizationId: string | null
  eventType: DomainEventType
  aggregateType: string
  aggregateId: string
  payload: TPayload
  createdAt: string
}

export interface NewDomainEvent<TPayload = unknown> {
  organizationId?: string | null
  eventType: DomainEventType
  aggregateType: string
  aggregateId: string
  payload: TPayload
}
