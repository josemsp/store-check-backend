import type { DomainEvent } from './domain-event'

export interface DomainEventRepository {
  save(event: DomainEvent): Promise<void>
}
