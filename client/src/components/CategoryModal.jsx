// src/components/CategoryModal.js
import { Modal, Form, Input, Switch, InputNumber } from "antd";
import React, { useEffect } from "react";

const CategoryModal = ({ visible, onCancel, onSubmit, initialValues }) => {
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
      className="category-modal"
      title={initialValues ? "Edit Compliance Category" : "Add Compliance Category"}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={initialValues ? "Update" : "Add"}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter category name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Please enter category code" }]}
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
          label="Status"
          name="status"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Validity (days)"
          name="defaultValidityDays"
          rules={[{ required: true, message: "Enter validity in days" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
