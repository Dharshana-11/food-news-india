// src/components/common/SearchInput.jsx
import { Input } from "antd";
const { Search } = Input;

const SearchInput = ({ placeholder = "Search...", onSearch, style = {} }) => {
  return (
    <Search
      placeholder={placeholder}
      onSearch={onSearch}
      enterButton
      allowClear
      style={{ width: 300, marginBottom: 16, ...style }}
    />
  );
};

export default SearchInput;
