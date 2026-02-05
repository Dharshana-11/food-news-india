// pages/BusinessOwner/DocumentVault/FilterDrawer.jsx

import { useEffect } from "react";
import { Drawer, Form, Select, Button, Divider } from "antd";
import { FilterOutlined } from "@ant-design/icons";

/**
 * Filter drawer for document vault
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether the drawer is open
 * @param {function} props.onClose - Callback when drawer is closed
 * @param {function} props.onApply - Callback when filters should be applied
 * @param {Object} props.currentFilters - Current filter values
 * @param {string|null} props.currentFilters.status
 * @param {string|null} props.currentFilters.expiry
 */
const FilterDrawer = ({ visible, onClose, onApply, currentFilters = {} }) => {
  const [form] = Form.useForm();

  // Sync form values when drawer opens
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(currentFilters || {});
    }
  }, [visible, currentFilters, form]);

  /** Apply filters */
  const handleApply = () => {
    try {
      const values = form.getFieldsValue();
      onApply(values);
    } catch (err) {
      console.error("Failed to apply filters:", err);
    }
  };

  /** Reset filters */
  const handleReset = () => {
    form.resetFields();
    onApply({
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
        {/* Status Filter */}
        <Form.Item label="Status" name="status">
          <Select placeholder="All statuses" allowClear>
            <Select.Option value="pending">Pending Review</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
        </Form.Item>

        <Divider />

        {/* Expiry Filter */}
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
