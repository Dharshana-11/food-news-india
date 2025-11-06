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

const CustomTable = ({ columns, data }) => (
  <div className="custom-table-wrapper">
    {/* Scrollable container for horizontal overflow handling */}
    <div className="custom-table-scroll">
      <Table
        columns={columns} // Table column definitions
        dataSource={data} // Data array
        rowKey={(record, index) => record.id || index} // Unique key for each row
        pagination={false} // No pagination (dashboard layout friendly)
        bordered={false} // Clean borderless look
        className="custom-table" // Custom CSS class for theme consistency
      />
    </div>
  </div>
);

export default CustomTable;
