/*
Hook for getting and setting a specific record from the syncdb,
defined by a primary key {table, id}.
*/

import { useSyncdbRecord } from "@cocalc/frontend/app-framework/syncdb";
import { useCallback } from "react";

export default function useRecord<T>({
  table,
  id,
  defaultValue,
}: {
  table: string;
  id: string; // id of a view if the given dbtable.
  defaultValue: T;
}): [record: T, setRecord: (value: T) => void] {
  const [record, setRecord0] = useSyncdbRecord<T>({
    key: { id, table } as any,
    defaultValue: { ...defaultValue, id, table },
  });
  const setRecord = useCallback(
    (value: T) => {
      setRecord0({ ...value, table, id });
    },
    [table, id, setRecord0]
  );

  return [record, setRecord];
}
