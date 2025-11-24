// pages/BusinessTypes/BusinessTypeForm.jsx
import { useEffect } from "react";
import { Form, Input, InputNumber, Switch, Button, message } from "antd";
import { createBusinessType, updateBusinessType } from "../../services/businessTypeService";

const BusinessTypeForm = ({ editingRecord, onSuccess, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({
        name: editingRecord.name,
        code: editingRecord.code,
        description: editingRecord.description,
        status: editingRecord.status === "active",
        sortOrder: editingRecord.sortOrder,
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        description: values.description,
        status: values.status ? "active" : "inactive",
        sortOrder: values.sortOrder || 0,
      };

      if (editingRecord) {
        await updateBusinessType(editingRecord._id, payload);
        message.success("Business type updated successfully");
      } else {
        await createBusinessType(payload);
        message.success("Business type created successfully");
      }
      
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
      console.error(error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ status: true, sortOrder: 0 }}
      className="business-type-form"
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please enter business type name" }]}
      >
        <Input placeholder="e.g., Restaurant" />
      </Form.Item>

      <Form.Item
        label="Code"
        name="code"
        rules={[
          { required: true, message: "Please enter code" },
          { pattern: /^[A-Z0-9_]+$/, message: "Code must be uppercase alphanumeric with underscores" },
        ]}
      >
        <Input placeholder="e.g., REST" disabled={!!editingRecord} />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea rows={4} placeholder="Describe the business type..." />
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
        <Button type="primary" htmlType="submit">
          {editingRecord ? "Update" : "Create"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BusinessTypeForm;