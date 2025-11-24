// pages/ComplianceMappings/MappingForm.jsx
import { useState, useEffect } from "react";
import { Form, Select, Button, message, InputNumber, Switch } from "antd";
import {
  createOrUpdateMapping,
  getBusinessTypesForDropdown,
  getComplianceItemsForDropdown,
} from "../../services/complianceMappingService";

const MappingForm = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [types, items] = await Promise.all([
        getBusinessTypesForDropdown(),
        getComplianceItemsForDropdown(),
      ]);

      setBusinessTypes(types || []);
      setComplianceItems(items || []);
    } catch (error) {
      message.error("Failed to load form data");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        businessTypeId: values.businessTypeId,
        complianceItemId: values.complianceItemId,
        applicability: values.applicability,
        status: values.status ? "active" : "inactive",
        sortOrder: values.sortOrder || 0,
        createdBy: "Super Admin",
        updatedBy: "Super Admin",
      };

      await createOrUpdateMapping(payload);
      message.success("Mapping created successfully");
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ applicability: "required", status: true, sortOrder: 0 }}
      className="mapping-form"
    >
      <Form.Item
        label="Business Type"
        name="businessTypeId"
        rules={[{ required: true, message: "Please select business type" }]}
      >
        <Select
          placeholder="Select business type"
          showSearch
          optionFilterProp="children"
        >
          {businessTypes.map((type) => (
            <Select.Option key={type._id} value={type._id}>
              {type.name} ({type.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Compliance Item"
        name="complianceItemId"
        rules={[{ required: true, message: "Please select compliance item" }]}
      >
        <Select
          placeholder="Select compliance item"
          showSearch
          optionFilterProp="children"
        >
          {complianceItems.map((item) => (
            <Select.Option key={item._id} value={item._id}>
              {item.name} ({item.code})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Applicability"
        name="applicability"
        rules={[{ required: true, message: "Please select applicability" }]}
      >
        <Select placeholder="Select applicability">
          <Select.Option value="required">Required</Select.Option>
          <Select.Option value="optional">Optional</Select.Option>
          <Select.Option value="not_applicable">Not Applicable</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Sort Order" name="sortOrder">
        <InputNumber min={0} placeholder="0" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Status" name="status" valuePropName="checked">
        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
      </Form.Item>

      <Form.Item className="form-actions">
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Mapping
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MappingForm;