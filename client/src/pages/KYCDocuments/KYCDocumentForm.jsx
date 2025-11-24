import { useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import {
  createKYCDocument,
  updateKYCDocument,
} from "../../services/kycDocumentService";
import { useAuth } from "../../context/AuthContext";

/**
 * Form component for creating or editing a KYC Document.
 *
 * @param {Object} props
 * @param {Object|null} props.editingRecord - The document being edited, or null for creating new.
 * @param {Function} props.onSuccess - Callback after successful create/update.
 * @param {Function} props.onCancel - Callback when the form is cancelled.
 */
const KYCDocumentForm = ({ editingRecord, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  // Prefill form when editing a record
  useEffect(() => {
    if (editingRecord) {
      const flatRoles = editingRecord.applicableRoles.flat();
      form.setFieldsValue({
        name: editingRecord.name,
        code: editingRecord.code,
        description: editingRecord.description,
        applicableRoles: flatRoles,
      });
    } else {
      form.resetFields();
    }
  }, [editingRecord, form]);

  /**
   * Handles form submission for creating or updating a KYC document.
   * @param {Object} values - Form values
   */
  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        description: values.description,
        applicableRoles: values.applicableRoles,
        createdBy: currentUser?._id,
        updatedBy: currentUser?._id,
      };

      if (editingRecord) {
        await updateKYCDocument(editingRecord._id, payload);
        message.success("KYC document updated successfully");
      } else {
        await createKYCDocument(payload);
        message.success("KYC document created successfully");
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
      className="kyc-document-form"
    >
      <Form.Item
        label="Document Name"
        name="name"
        rules={[{ required: true, message: "Please enter document name" }]}
      >
        <Input placeholder="e.g., Aadhaar Card" />
      </Form.Item>

      <Form.Item
        label="Code"
        name="code"
        rules={[
          { required: true, message: "Please enter code" },
          {
            pattern: /^[A-Z0-9_]+$/,
            message: "Code must be uppercase alphanumeric with underscores",
          },
        ]}
      >
        <Input placeholder="e.g., AADHAAR" disabled={!!editingRecord} />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please enter description" }]}
      >
        <Input.TextArea rows={4} placeholder="Describe the document..." />
      </Form.Item>

      <Form.Item
        label="Applicable Roles"
        name="applicableRoles"
        rules={[{ required: true, message: "Please select at least one role" }]}
      >
        <Select
          mode="multiple"
          placeholder="Select applicable roles"
          options={[
            { label: "Business Owner", value: "business_owner" },
            { label: "Agent", value: "agent" },
            { label: "Service Provider", value: "service_provider" },
          ]}
        />
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

export default KYCDocumentForm;
