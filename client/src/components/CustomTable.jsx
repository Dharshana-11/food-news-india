import { Table, Tag } from "antd";

const CustomTable = ({ columns, data }) => {
  return (
    <div className="custom-table">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered={false}
        style={{
          borderRadius: "12px",
          fontFamily: "Poppins, Inter, sans-serif",
        }}
      />
    </div>
  );
};

export default CustomTable;
