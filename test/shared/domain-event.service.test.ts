import { describe, expect, it } from 'vitest'

import {
  DomainEventService,
  DomainEventType,
  InMemoryDomainEventRepository,
} from '../../src/shared/domain-events'

describe('DomainEventService', () => {
  it('creates and persists an auditable domain event', async () => {
    const repository = new InMemoryDomainEventRepository()
    const service = new DomainEventService({
      repository,
      createId: () => 'event-id',
      now: () => new Date('2026-06-07T00:00:00.000Z'),
    })

    const event = await service.publish({
      organizationId: 'organization-id',
      eventType: DomainEventType.PURCHASE_CONFIRMED,
      aggregateType: 'purchase',
      aggregateId: 'purchase-id',
      payload: { total: 1250 },
    })

    expect(event).toEqual({
      id: 'event-id',
      organizationId: 'organization-id',
      eventType: 'PurchaseConfirmed',
      aggregateType: 'purchase',
      aggregateId: 'purchase-id',
      payload: { total: 1250 },
      createdAt: '2026-06-07T00:00:00.000Z',
    })
    expect(repository.events).toEqual([event])
  })
})
