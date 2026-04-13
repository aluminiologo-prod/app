import type { QueryClient } from '@tanstack/react-query';

type Entity = 'transferences' | 'in-transit' | 'stores' | 'stockMatrix';

const INVALIDATION_MAP: Record<Entity, Entity[]> = {
  'transferences': ['transferences', 'in-transit', 'stockMatrix'],
  'in-transit': ['in-transit', 'transferences', 'stockMatrix'],
  'stores': ['stores'],
  'stockMatrix': ['stockMatrix'],
};

export function invalidateEntity(queryClient: QueryClient, entity: Entity) {
  const targets = INVALIDATION_MAP[entity] ?? [entity];
  for (const target of targets) {
    queryClient.invalidateQueries({ queryKey: [target] });
  }
}
