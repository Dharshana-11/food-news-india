import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

/**
 * FilterBar Component
 *
 * Provides a search input and status filter buttons for business types.
 *
 * @param {Object} props
 * @param {string} props.searchText - Current search text
 * @param {function} props.setSearchText - Setter function for search text
 * @param {string} props.statusFilter - Current status filter ("all" | "active" | "inactive")
 * @param {function} props.setStatusFilter - Setter function for status filter
 */
const FilterBar = ({
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
}) => {
  const statusButtons = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  return (
    <div className="filter-bar">
      <Search
        placeholder="Search business types..."
        allowClear
        size="large"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-bar"
      />

      <div className="filter-buttons">
        {statusButtons.map((btn) => (
          <Button
            key={btn.value}
            type={statusFilter === btn.value ? "primary" : "default"}
            onClick={() => setStatusFilter(btn.value)}
            className="filter-btn"
          >
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
