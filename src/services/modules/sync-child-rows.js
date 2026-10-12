export async function syncChildRows({
  supabase,
  table,
  parentColumn,
  parentId,
  currentRows = [],
  nextRows = [],
  keyFields,
  createRow,
}) {
  const makeKey = (row) => JSON.stringify(keyFields.map((field) => String(row?.[field] ?? '').trim()));
  const currentKeys = new Set(currentRows.map(makeKey));
  const nextRowsByKey = new Map(nextRows.map((row) => [makeKey(row), row]));

  const rowsToInsert = [...nextRowsByKey.entries()]
    .filter(([key]) => !currentKeys.has(key))
    .map(([, row]) => createRow(parentId, row));

  if (rowsToInsert.length > 0) {
    const { error } = await supabase.from(table).insert(rowsToInsert);
    if (error) throw error;
  }

  const nextKeys = new Set(nextRowsByKey.keys());
  const idsToDelete = currentRows
    .filter((row) => !nextKeys.has(makeKey(row)))
    .map((row) => row.id)
    .filter((id) => id !== null && id !== undefined);

  if (idsToDelete.length > 0) {
    const { error } = await supabase.from(table).delete().in('id', idsToDelete);
    if (error) throw error;
  }
}