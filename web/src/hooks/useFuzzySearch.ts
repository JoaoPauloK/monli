// Copyright (c) 2026 Monli. All rights reserved.
import { useMemo } from 'react'
import Fuse, { type IFuseOptions } from 'fuse.js'

export function useFuzzySearch<T>(
  list: T[],
  query: string,
  options: IFuseOptions<T>,
): T[] {
  const fuse = useMemo(() => new Fuse(list, { threshold: 0.35, ...options }), [list, options])
  return useMemo(
    () => (query.trim() ? fuse.search(query).map((r) => r.item) : list),
    [fuse, query, list],
  )
}
