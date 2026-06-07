import type { DomainEvent } from './domain-event'
import type { DomainEventRepository } from './domain-event.repository'

export class InMemoryDomainEventRepository implements DomainEventRepository {
  readonly events: DomainEvent[] = []

  save(event: DomainEvent): Promise<void> {
    this.events.push(event)
    return Promise.resolve()
  }
}
