// src/components/ComplianceItemModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Select, InputNumber } from "antd";

const { Option } = Select;

/**
 * Modal form for adding or editing a Compliance Item
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Controls modal visibility
 * @param {Function} props.onCancel - Called when modal is cancelled
 * @param {Function} props.onSubmit - Called with form values on submit
 * @param {Object} [props.initialValues] - Initial values for editing
 */
const ComplianceItemModal = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  // Populate or reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  /**
   * Handle modal OK button click
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (info) {
      console.error("Validation Failed:", info);
    }
  };

  return (
    <Modal
      className="compliance-item-modal"
      title={initialValues ? "Edit Compliance Item" : "Add Compliance Item"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={initialValues ? "Update" : "Add"}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter item name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Please enter item code" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Validity (Days)"
          name="validityDays"
          rules={[
            { required: true, message: "Please enter validity in days" },
            { type: "number", min: 1, message: "Must be at least 1 day" },
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={1} />
        </Form.Item>

        <Form.Item label="Required" name="required" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Rule Expression" name="ruleExpression">
          <Input placeholder="e.g., businessType=='Restaurant'" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComplianceItemModal;
