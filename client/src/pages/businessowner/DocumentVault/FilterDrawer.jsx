// pages/BusinessOwner/DocumentVault/FilterDrawer.jsx
import { useState, useEffect } from "react";
import { Drawer, Form, Select, Button, Divider } from "antd";
import { FilterOutlined } from "@ant-design/icons";

const FilterDrawer = ({ visible, onClose, onApply, currentFilters }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(currentFilters);
    }
  }, [visible, currentFilters, form]);

  const handleApply = () => {
    const values = form.getFieldsValue();
    onApply(values);
  };

  const handleReset = () => {
    form.resetFields();
    onApply({
      category: null,
      status: null,
      expiry: null,
    });
  };

  return (
    <Drawer
      title={
        <div className="drawer-title">
          <FilterOutlined /> Filter Documents
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
      className="filter-drawer"
      footer={
        <div className="drawer-footer">
          <Button onClick={handleReset} style={{ marginRight: 8 }}>
            Reset
          </Button>
          <Button type="primary" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Status" name="status">
          <Select placeholder="All statuses" allowClear>
            <Select.Option value="pending">Pending Review</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item label="Expiry Status" name="expiry">
          <Select placeholder="All documents" allowClear>
            <Select.Option value="expiring_soon">
              Expiring Soon (30 days)
            </Select.Option>
            <Select.Option value="expired">Expired</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default FilterDrawer;
