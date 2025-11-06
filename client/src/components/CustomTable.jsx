import { Table, Tag } from "antd";

const CustomTable = ({ columns, data }) => {
  return (
    <div className="custom-table-wrapper">
      <div className="custom-table-scroll">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered={false}
          className="custom-table"
        />
      </div>
    </div>
  );
};

export default CustomTable;
