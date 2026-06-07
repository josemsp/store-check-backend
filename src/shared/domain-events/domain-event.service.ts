import type {
  DomainEvent,
  NewDomainEvent,
} from './domain-event'
import type { DomainEventRepository } from './domain-event.repository'

interface DomainEventServiceDependencies {
  repository: DomainEventRepository
  createId?: () => string
  now?: () => Date
}

export class DomainEventService {
  private readonly repository: DomainEventRepository
  private readonly createId: () => string
  private readonly now: () => Date

  constructor({
    repository,
    createId = () => crypto.randomUUID(),
    now = () => new Date(),
  }: DomainEventServiceDependencies) {
    this.repository = repository
    this.createId = createId
    this.now = now
  }

  async publish<TPayload>(
    input: NewDomainEvent<TPayload>,
  ): Promise<DomainEvent<TPayload>> {
    const event: DomainEvent<TPayload> = {
      id: this.createId(),
      organizationId: input.organizationId ?? null,
      eventType: input.eventType,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      payload: input.payload,
      createdAt: this.now().toISOString(),
    }

    await this.repository.save(event)

    return event
  }
}
