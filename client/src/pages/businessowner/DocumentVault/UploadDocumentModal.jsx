// pages/BusinessOwner/DocumentVault/UploadDocumentModal.jsx
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Upload,
  Button,
  message,
  Radio,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import {
  uploadDocument,
  getDocumentCategories,
} from "../../../services/documentVaultService";

const { Dragger } = Upload;

const UploadDocumentModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [documentType, setDocumentType] = useState("kyc");
  const [categories, setCategories] = useState({ kyc: [], compliance: [] });

  useEffect(() => {
    if (visible) fetchCategories();
  }, [visible]);

  const fetchCategories = async () => {
    try {
      const response = await getDocumentCategories();
      setCategories(response.data);
    } catch (error) {
      message.error("Failed to load document categories");
    }
  };

  const handleSubmit = async (values) => {
    if (!fileList.length) {
      message.error("Please select a file to upload");
      return;
    }

    const fileObj = fileList[0]?.originFileObj || fileList[0];
    if (!fileObj) {
      message.error("No valid file selected");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileObj);

      if (documentType === "kyc") {
        formData.append("kycDocumentId", values.documentId);
      } else {
        formData.append("complianceItemId", values.documentId);
        if (values.validFrom) {
          formData.append("validFrom", values.validFrom.toISOString());
        }
      }

      console.log("Sending FormData...");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await uploadDocument(formData);
      message.success("Document uploaded successfully");
      form.resetFields();
      setFileList([]);
      setDocumentType("kyc");
      onSuccess();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to upload document"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ].includes(file.type);
      if (!isValidType) {
        message.error("Only PDF, JPG, and PNG files are allowed!");
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
      return false; // prevent auto-upload
    },
    onRemove: () => setFileList([]),
    fileList,
    maxCount: 1,
  };

  const handleModalCancel = () => {
    form.resetFields();
    setFileList([]);
    setDocumentType("kyc");
    onCancel();
  };

  return (
    <Modal
      title="Upload Document"
      open={visible}
      onCancel={handleModalCancel}
      footer={null}
      width={600}
      className="upload-document-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ documentType: "kyc" }}
      >
        {/* Document Type */}
        <Form.Item
          label="Document Type"
          name="documentType"
          rules={[{ required: true, message: "Please select document type" }]}
        >
          <Radio.Group
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value);
              form.setFieldValue("documentId", undefined);
            }}
          >
            <Radio.Button value="kyc">KYC Document</Radio.Button>
            <Radio.Button value="compliance">Compliance Document</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Document Category */}
        <Form.Item
          label={
            documentType === "kyc" ? "KYC Document" : "Compliance Document"
          }
          name="documentId"
          rules={[
            { required: true, message: "Please select document category" },
          ]}
        >
          <Select
            placeholder="Select document category"
            showSearch
            optionFilterProp="children"
          >
            {documentType === "kyc"
              ? categories.kyc.map((doc) => (
                  <Select.Option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.code})
                  </Select.Option>
                ))
              : categories.compliance.map((doc) => (
                  <Select.Option key={doc._id} value={doc._id}>
                    {doc.name} ({doc.code})
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>

        {/* Valid From (Compliance Only) */}
        {documentType === "compliance" && (
          <Form.Item
            label="Valid From"
            name="validFrom"
            rules={[
              { required: true, message: "Please select valid from date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        )}

        {/* File Upload */}
        <Form.Item
          label="Upload File"
          required
          tooltip="PDF, JPG, PNG (Max 10MB)"
        >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for PDF, JPG, and PNG files (Max 10MB)
            </p>
          </Dragger>
        </Form.Item>

        {/* Actions */}
        <Form.Item className="form-actions">
          <Button onClick={handleModalCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!fileList.length}
          >
            Upload
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadDocumentModal;
