function createEntityKeys(entity: string) {
  return {
    all: [entity] as const,
    lists: () => [entity, 'list'] as const,
    list: (params: Record<string, unknown>) => [entity, 'list', params] as const,
    details: () => [entity, 'detail'] as const,
    detail: (id: string) => [entity, 'detail', id] as const,
  };
}

export const queryKeys = {
  transfers: createEntityKeys('transferences'),
  inTransit: createEntityKeys('in-transit'),
  stores: createEntityKeys('stores'),
  countries: createEntityKeys('countries'),
};
