/**
 * @file UserForm.jsx
 * @description A reusable form component for adding or editing user information.
 * @module components/UserForm
 * @requires antd
 * @version 1.0.0
 * @example
 * // Basic usage
 * <UserForm
 *   mode="add"
 *   visible={isModalVisible}
 *   onCancel={handleCancel}
 *   onSubmit={handleSubmit}
 *   initialValues={selectedUser}
 *   loading={isLoading}
 * />
 */

import React, { useEffect } from "react";
import { Form, Input, Select, Modal } from "antd";

const { Option } = Select;

/**
 * UserForm Component
 * @param {Object} props - Component props
 * @param {'add'|'edit'} [props.mode='add'] - Form mode, either 'add' or 'edit'
 * @param {boolean} props.visible - Controls the visibility of the form modal
 * @param {Function} props.onCancel - Callback when the form is canceled
 * @param {Function} props.onSubmit - Callback when the form is submitted
 * @param {Object} [props.initialValues={}] - Initial form values for edit mode
 * @param {string} [props.initialValues.name] - User's full name
 * @param {string} [props.initialValues.email] - User's email address
 * @param {string} [props.initialValues.role] - User's role (admin, user, etc.)
 * @param {string} [props.initialValues.phone] - User's phone number
 * @param {boolean} [props.loading=false] - Loading state for form submission
 * @returns {JSX.Element} A form modal for user creation/editing
 * 
 * @example
 * // Example usage in a parent component
 * const [isModalVisible, setIsModalVisible] = useState(false);
 * const [editingUser, setEditingUser] = useState(null);
 * 
 * const handleSubmit = async (values) => {
 *   if (editingUser) {
 *     await updateUser(editingUser.id, values);
 *   } else {
 *     await createUser(values);
 *   }
 *   setIsModalVisible(false);
 * };
 * 
 * return (
 *   <UserForm
 *     mode={editingUser ? 'edit' : 'add'}
 *     visible={isModalVisible}
 *     onCancel={() => {
 *       setEditingUser(null);
 *       setIsModalVisible(false);
 *     }}
 *     onSubmit={handleSubmit}
 *     initialValues={editingUser || {}}
 *   />
 * );
 */
const UserForm = ({
  mode = "add",
  visible,
  onCancel,
  onSubmit,
  initialValues = {},
  loading = false,
}) => {
  const [form] = Form.useForm();

  // Always reset and then set form values freshly when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (mode === "edit" && initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible]);

  // Reactively watch the "role" field value (this updates instantly)
  const roleValue = Form.useWatch("role", form);
  const isAdminRole =
    roleValue === "admin" ||
    roleValue === "super_admin" ||
    initialValues?.role === "admin" ||
    initialValues?.role === "super_admin";

  const handleFinish = async (values) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={mode === "add" ? "Add New User" : "Edit User"}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={mode === "add" ? "Create" : "Save Changes"}
      confirmLoading={loading}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
        preserve={false} // ensure old values are not preserved
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter name" }]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select placeholder="Select a role" disabled={mode === "edit"}>
            <Option value="super_admin">Super Admin</Option>
            <Option value="admin">Admin</Option>
            <Option value="agent">Agent</Option>
            <Option value="service_provider">Service Provider</Option>
            <Option value="business_owner">Business Owner</Option>
          </Select>
        </Form.Item>

        {/* Dynamically render fields based on role */}
        {isAdminRole ? (
          <>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Please enter email" }]}
            >
              <Input type="email" placeholder="Enter email address" />
            </Form.Item>

            {/* Only show password when adding, not editing */}
            {mode === "add" && (
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: "Please enter password" }]}
              >
                <Input.Password placeholder="Set initial password" />
              </Form.Item>
            )}
          </>
        ) : (
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UserForm;
