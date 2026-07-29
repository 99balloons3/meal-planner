export function mergeCollection(serverRows, localRows, pendingIds) {
  const localById = new Map(localRows.map((r) => [r.id, r]));
  const result = [];
  const seen = new Set();
  for (const row of serverRows) {
    if (pendingIds.has(row.id)) {
      if (localById.has(row.id)) {
        result.push(localById.get(row.id));
        seen.add(row.id);
      }
      continue; // pending delete: server row dropped
    }
    result.push(row);
    seen.add(row.id);
  }
  for (const row of localRows) {
    if (!seen.has(row.id) && pendingIds.has(row.id)) {
      result.push(row);
    }
  }
  return result;
}
