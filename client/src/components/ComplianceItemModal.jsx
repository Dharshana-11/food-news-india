// src/components/ComplianceItemModal.js
import { Modal, Form, Input, Switch, Select } from "antd";
import React, { useEffect } from "react";

const { Option } = Select;

const ComplianceItemModal = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch((info) => console.log("Validation Failed:", info));
  };

  return (
    <Modal
      className="compliance-item-modal"
      title={initialValues ? "Edit Compliance Item" : "Add Compliance Item"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={initialValues ? "Update" : "Add"}
    >
      <Form form={form} layout="vertical">
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
          label="Required"
          name="required"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Rule Expression"
          name="ruleExpression"
        >
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
            <Option value="trash">Trash</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComplianceItemModal;
