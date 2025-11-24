/**
 * CustomTable Component
 * ---------------------
 * A reusable wrapper around Ant Design's Table component.
 * It provides consistent styling, a scrollable container, and
 * disables pagination for simplified dashboard usage.
 *
 * @component
 * @param {Object[]} columns - Column configuration for the AntD Table.
 * @param {Object[]} data - Array of data objects to display as rows.
 *
 * @example
 * const columns = [
 *   { title: "Name", dataIndex: "name", key: "name" },
 *   { title: "Role", dataIndex: "role", key: "role" },
 * ];
 *
 * const data = [
 *   { id: 1, name: "John Doe", role: "Admin" },
 *   { id: 2, name: "Jane Smith", role: "User" },
 * ];
 *
 * <CustomTable columns={columns} data={data} />
 */

import { Table } from "antd";

const CustomTable = ({
  columns,
  data,
  loading,
  pagination = false,
  onChange,
}) => (
  <div className="custom-table-wrapper">
    <div className="custom-table-scroll">
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record, index) => record.id || index}
        loading={loading}
        pagination={pagination} // false disables, object enables
        onChange={onChange}
        className="custom-table"
      />
    </div>
  </div>
);

export default CustomTable;
