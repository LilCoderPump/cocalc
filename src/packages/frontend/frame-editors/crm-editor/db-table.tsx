import { useMemo, ReactNode } from "react";
import { webapp_client } from "@cocalc/frontend/webapp-client";
import { Button, Space, Table } from "antd";
import { EditableContext } from "./edit";
import { useTable } from "./table";
import { client_db } from "@cocalc/util/db-schema";
import { capitalize, replace_all } from "@cocalc/util/misc";

import Cards from "./cards";

interface Props {
  title?: ReactNode;
  query: object;
  expandable?;
  columns;
  allowCreate?: boolean;
  changes?: boolean;
  view: "table" | "cards";
}

export default function DBTable({
  title,
  query,
  expandable,
  columns,
  allowCreate,
  changes,
  view,
}: Props) {
  const { rowKey, table } = useMemo(() => {
    const table = Object.keys(query)[0];
    if (!table) {
      throw Error("invalid query");
    }
    const keys = client_db.primary_keys(table);
    if (keys.length != 1) {
      throw Error("must be a unique primary key");
    }
    const rowKey = keys[0];
    return { rowKey, table };
  }, [query]);

  const [data, refresh, editableContext] = useTable({
    query,
    changes,
  });

  async function addNew() {
    await webapp_client.query_client.query({
      query: { [table]: { created: new Date(), last_edited: new Date() } },
    });
    refresh();
  }

  const header = (
    <>
      <b>{title ?? capitalize(replace_all(table, "_", " "))}</b>
      <Space wrap style={{ float: "right", marginTop: "-5px" }}>
        {allowCreate && <Button onClick={addNew}>New</Button>}
        {!changes && <Button onClick={refresh}>Refresh</Button>}
      </Space>
    </>
  );

  let body;
  switch (view) {
    case "cards":
      body = (
        <Cards rowKey={rowKey} data={data} columns={columns} title={header} />
      );
      break;
    default:
      body = (
        <Table
          size="middle"
          rowKey={rowKey}
          style={{ overflow: "auto", margin: "15px" }}
          dataSource={data}
          columns={columns}
          bordered
          expandable={expandable}
          title={() => header}
        />
      );
      break;
  }

  return (
    <EditableContext.Provider value={editableContext}>
      <div style={{ height: "100%", overflow: "auto" }}>{body}</div>
    </EditableContext.Provider>
  );
}
