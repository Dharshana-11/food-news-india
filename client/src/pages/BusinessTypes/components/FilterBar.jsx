import { Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const FilterBar = ({ searchText, setSearchText, statusFilter, setStatusFilter }) => {
  return (
    <div className="filter-bar">
      <Search
        placeholder="Search business types..."
        allowClear
        size="large"
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-bar"
      />

      <div className="filter-buttons">
        <Button
          type={statusFilter === "all" ? "primary" : "default"}
          onClick={() => setStatusFilter("all")}
          className="filter-btn"
        >
          All
        </Button>

        <Button
          type={statusFilter === "active" ? "primary" : "default"}
          onClick={() => setStatusFilter("active")}
          className="filter-btn"
        >
          Active
        </Button>

        <Button
          type={statusFilter === "inactive" ? "primary" : "default"}
          onClick={() => setStatusFilter("inactive")}
          className="filter-btn"
        >
          Inactive
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
