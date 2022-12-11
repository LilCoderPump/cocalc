import { TimeAgo } from "@cocalc/frontend/components";
import { cmp_Date } from "@cocalc/util/cmp";
import { EditableMarkdown, EditableText } from "./edit";
import DBTable from "./db-table";

const query = {
  crm_organizations: [
    {
      id: null,
      last_edited: null,
      name: null,
      people_ids: null,
      organization_ids: null,
      deleted: null,
      notes: null,
    },
  ],
};

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (value, { id }) => (
      <EditableText key={id} id={id} field="name" defaultValue={value} />
    ),
  },
  {
    title: "Edited",
    ellipsis: true,
    dataIndex: "last_edited",
    key: "last_edited",
    sorter: (a, b) => cmp_Date(a.last_edited, b.last_edited),
    render: (_, { last_edited }) => <TimeAgo date={last_edited} />,
  },
  {
    title: "People",
    dataIndex: "people_ids",
    key: "accounts",
    render: (_, record) => {
      return <>{JSON.stringify(record.people_ids)}</>;
    },
  },
  {
    title: "Organizations",
    dataIndex: "organization_ids",
    key: "organization_ids",
    render: (_, record) => {
      return <>{JSON.stringify(record.organization_ids)}</>;
    },
  },
];

export default function Organizations({}) {
  return (
    <DBTable
      view={"table"}
      title={"Organizations"}
      query={query}
      columns={columns}
      changes
      allowCreate
      expandable={{
        expandedRowRender: ({ id, notes }) => (
          <EditableMarkdown id={id} field="notes" defaultValue={notes} />
        ),
      }}
    />
  );
}
