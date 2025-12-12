import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

/**
 * Modal form for creating a support ticket.
 *
 * Features:
 * - Allows users to submit category, priority, description, SLA, and attachments.
 * - Converts uploaded files to an array of filenames before sending to backend.
 * - Calls `onSuccess()` after a successful ticket creation.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Controls whether the modal is visible.
 * @param {Function} props.onCancel - Callback fired when the modal is cancelled/closed.
 * @param {Function} props.onSuccess - Callback fired after a successful ticket creation.
 * @returns {JSX.Element} A modal that contains a form to create a ticket.
 */

const CreateTicketModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  /**
   * Handles ticket submission:
   * - Converts uploaded attachments to an array of file names.
   * - Sends ticket data to the backend API.
   * - Resets the form and triggers success callback on completion.
   *
   * @async
   * @function handleSubmit
   * @param {Object} values - Form field values.
   * @param {string} values.category - Ticket category.
   * @param {string} values.priority - Ticket priority (Low, Medium, High).
   * @param {string} values.description - Description of the issue.
   * @param {moment.Moment|undefined} [values.sla] - Optional SLA deadline (DatePicker value).
   * @param {Array<Object>} [values.attachments] - Uploaded file objects from antd Upload component.
   * @returns {Promise<void>}
   */

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);

      // Convert attachments -> array of URLs or file names (your choice)

      /**
       * Extract uploaded file names from the file list provided by Ant Design Upload component.
       * Used to store filenames instead of full file objects.
       *
       * @constant
       * @type {string[]}
       */

      const formData = new FormData();
      formData.append("category", values.category);
      formData.append("priority", values.priority);
      formData.append("description", values.description);

      if (values.sla) {
        formData.append("sla", values.sla.toISOString());
      }

      if (values.attachments?.length) {
        values.attachments.forEach((file) => {
          formData.append("attachments", file.originFileObj);
        });
      }

      await axios.post("http://localhost:5000/api/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Ticket created successfully");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Error creating ticket:", error);
      message.error("Failed to create ticket");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Create New Ticket"
      okText="Create"
      cancelText="Cancel"
      onCancel={submitLoading ? null : onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitLoading}
      maskClosable={!submitLoading}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ priority: "Medium" }}
        disabled={submitLoading}
      >
        {/* CATEGORY */}
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select category">
            <Option value="Compliance">Compliance</Option>
            <Option value="Login Issue">Login Issue</Option>
            <Option value="Payment">Payment</Option>
            <Option value="Agent Not Responding">
              Agent / Service Provider Not Responding
            </Option>
            <Option value="Delayed Service">Delayed Service</Option>
            <Option value="Technical Error">Technical Error</Option>
            <Option value="Data Update Request">Data Update Request</Option>
            <Option value="Access Request">Access Request</Option>
            <Option value="System Downtime">System Downtime</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        {/* PRIORITY */}
        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: "Please select a priority" }]}
        >
          <Select>
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
          </Select>
        </Form.Item>

        {/* DESCRIPTION */}
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={4} placeholder="Describe the issue..." />
        </Form.Item>

        {/* SLA (optional) */}
        <Form.Item name="sla" label="SLA Deadline">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* ATTACHMENTS */}
        <Form.Item
          name="attachments"
          label="Attachments"
          valuePropName="fileList"
          getValueFromEvent={(e) => e.fileList}
        >
          <Upload beforeUpload={() => false} multiple>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTicketModal;
