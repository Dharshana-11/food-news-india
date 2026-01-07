/**
 * UploadDocumentModal.jsx (Agent Version)
 * ============================================================================
 * Upload Document Modal
 *
 * Modal component that allows agents to upload documents for an assigned
 * business. Supports both KYC and Compliance document uploads with:
 * - Category selection
 * - File validation (type & size)
 * - Compliance validity date handling
 *
 * Upload permissions and category availability are enforced via backend APIs.
 */

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Upload,
  DatePicker,
  Button,
  message,
  Divider,
} from "antd";
import {
  InboxOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import agentDocumentService from "../../services/agentDocumentService";
import dayjs from "dayjs";

const { Option } = Select;
const { Dragger } = Upload;

const UploadDocumentModal = ({ visible, onClose, onSuccess, relationId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({ kyc: [], compliance: [] });
  const [categoryType, setCategoryType] = useState("compliance");
  const [fileList, setFileList] = useState([]);

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    if (visible && relationId) {
      fetchCategories();
    }
  }, [visible, relationId]);

  /* =========================================================================
     API
     ========================================================================= */

  /**
   * Fetch available document categories (KYC & Compliance)
   * for the selected business relation.
   */
  const fetchCategories = async () => {
    try {
      const response =
        await agentDocumentService.getDocumentCategories(relationId);

      // FIX: response already contains { kyc, compliance }
      setCategories(response.data || { kyc: [], compliance: [] });
    } catch (error) {
      console.error("Fetch categories error:", error);
      message.error("Failed to load document categories");
      setCategories({ kyc: [], compliance: [] });
    }
  };

  /* =========================================================================
     Upload Handler
     ========================================================================= */

  /**
   * Handle document upload submission.
   *
   * Validates:
   * - File selection
   * - Compliance validity date (if applicable)
   *
   * Submits multipart form data to the backend.
   */
  const handleUpload = async (values) => {
    if (fileList.length === 0) {
      message.error("Please select a file to upload");
      return;
    }

    if (categoryType === "compliance" && !values.validFrom) {
      message.error("Valid From is required for compliance documents");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("file", fileList[0].originFileObj);

      formData.append("relationId", relationId);
      formData.append("categoryType", categoryType);
      formData.append("categoryId", values.categoryId);

      if (categoryType === "compliance") {
        formData.append("validFrom", dayjs(values.validFrom).toISOString());
      }

      await agentDocumentService.uploadDocument(formData);

      message.success("Document uploaded successfully");
      form.resetFields();
      setFileList([]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload document");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     Upload Validation
     ========================================================================= */

  /**
   * Validate file before upload.
   *
   * Rules:
   * - Only one file allowed
   * - PDF or image formats only
   * - Maximum size: 10MB
   *
   * Prevents auto-upload and manages local file state.
   */
  const beforeUpload = (file) => {
    if (fileList.length > 0) {
      message.warning("Only one file allowed");
      return Upload.LIST_IGNORE;
    }

    const isValidType =
      file.type === "application/pdf" || file.type.startsWith("image/");

    if (!isValidType) {
      message.error("You can only upload PDF or image files!");
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;

    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }

    setFileList([
      {
        uid: file.uid,
        name: file.name,
        status: "done",
        originFileObj: file,
      },
    ]);

    return false; // prevent auto upload
  };

  /**
   * Remove selected file from upload list.
   */
  const handleRemove = () => {
    setFileList([]);
  };

  const currentCategories =
    categoryType === "kyc" ? categories.kyc : categories.compliance;

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <Modal
      title="Upload Document"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleUpload}>
        {/* Document Type */}
        <Form.Item label="Document Type" required>
          <Select
            value={categoryType}
            onChange={(value) => {
              setCategoryType(value);
              form.setFieldsValue({ categoryId: undefined });
            }}
            size="large"
          >
            <Option value="kyc">
              <SafetyCertificateOutlined /> KYC Document
            </Option>
            <Option value="compliance">
              <FileTextOutlined /> Compliance Document
            </Option>
          </Select>
        </Form.Item>

        {/* Category */}
        <Form.Item
          name="categoryId"
          label="Document Category"
          rules={[
            { required: true, message: "Please select a document category" },
          ]}
        >
          <Select
            placeholder="Select document category"
            size="large"
            showSearch
            optionFilterProp="children"
          >
            {currentCategories.map((cat) => (
              <Option key={cat._id} value={cat._id}>
                {cat.name}
                {cat.isMandatory && (
                  <span style={{ color: "#ff4d4f", marginLeft: 8 }}>
                    (Mandatory)
                  </span>
                )}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        {/* File Upload */}
        <Form.Item label="Upload File" required>
          <Dragger
            fileList={fileList}
            beforeUpload={beforeUpload}
            onRemove={handleRemove}
            maxCount={1}
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF, JPG, JPEG, PNG files (Max 10MB)
            </p>
          </Dragger>
        </Form.Item>

        {/* Validity Dates */}
        {categoryType === "compliance" && (
          <Form.Item
            label="Valid From"
            name="validFrom"
            rules={[
              { required: true, message: "Please select valid from date" },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              size="large"
              format="DD/MM/YYYY"
            />
          </Form.Item>
        )}

        {/* Actions */}
        <Form.Item>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Upload Document
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadDocumentModal;
