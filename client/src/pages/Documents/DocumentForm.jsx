// pages/Documents/DocumentForm.jsx
import { useState, useEffect } from "react";
import { Form, Select, DatePicker, Button, message, Upload, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  createDocument,
  updateDocument,
  getUsersForDropdown,
} from "../../services/documentService";
import { getKYCDocumentsForDropdown } from "../../services/kycDocumentService";
import { getComplianceItemsForDropdown } from "../../services/complianceMappingService";

const { Option } = Select;

/**
 * Form component for creating or editing a Document (KYC or Compliance)
 *
 * @param {Object} props
 * @param {Object|null} props.editingRecord - Existing document to edit
 * @param {Function} props.onSuccess - Callback when form is successfully submitted
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @returns {JSX.Element}
 */
const DocumentForm = ({ editingRecord, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [documentType, setDocumentType] = useState("kyc");
  const [users, setUsers] = useState([]);
  const [kycDocuments, setKycDocuments] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingRecord) {
      const type = editingRecord.kycDocumentId ? "kyc" : "compliance";
      setDocumentType(type);

      form.setFieldsValue({
        uploadedForUser: editingRecord.uploadedForUser?._id,
        documentType: type,
        kycDocumentId: editingRecord.kycDocumentId?._id,
        complianceItemId: editingRecord.complianceItemId?._id,
        validFrom: editingRecord.validFrom
          ? dayjs(editingRecord.validFrom)
          : null,
        status: editingRecord.status,
        reviewNotes: editingRecord.reviewNotes,
      });

      if (editingRecord.file) {
        setFileList([
          {
            uid: "-1",
            name: editingRecord.file.originalName,
            status: "done",
            url: `http://localhost:5000${editingRecord.file.filePath}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
      setDocumentType("kyc");
    }
  }, [editingRecord, form]);

  // Fetch all dropdown options in parallel
  const fetchDropdownData = async () => {
    try {
      const [usersRes, kycRes, complianceRes] = await Promise.allSettled([
        getUsersForDropdown(),
        getKYCDocumentsForDropdown(),
        getComplianceItemsForDropdown(),
      ]);

      setUsers(usersRes.status === "fulfilled" ? usersRes.value : []);
      setKycDocuments(kycRes.status === "fulfilled" ? kycRes.value : []);
      setComplianceItems(
        complianceRes.status === "fulfilled" ? complianceRes.value : [],
      );
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    }
  };

  /**
   * Handle form submission
   * @param {Object} values - Form values
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (fileList.length > 0) {
        const file = fileList[0];
        formData.append("file", file.originFileObj || file);
      }

      formData.append("uploadedForUser", values.uploadedForUser || "");

      if (documentType === "kyc") {
        formData.append("kycDocumentId", values.kycDocumentId);
      } else {
        formData.append("complianceItemId", values.complianceItemId);
        if (values.validFrom) {
          formData.append(
            "validFrom",
            dayjs(values.validFrom).format("YYYY-MM-DD"),
          );
        }
      }

      if (editingRecord) {
        if (values.status) formData.append("status", values.status);
        if (values.reviewNotes)
          formData.append("reviewNotes", values.reviewNotes);
        await updateDocument(editingRecord._id, formData);
        message.success("Document updated successfully");
      } else {
        await createDocument(formData);
        message.success("Document uploaded successfully");
      }

      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Upload validation
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

      setFileList([file]);
      return false;
    },
    onRemove: () => setFileList([]),
    fileList,
    maxCount: 1,
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ documentType: "kyc" }}
      className="document-form"
    >
      {/* Uploaded For User */}
      <Form.Item
        label="Upload For User (Optional)"
        name="uploadedForUser"
        tooltip="Leave empty if uploading for yourself"
      >
        <Select
          placeholder="Select user"
          showSearch
          allowClear
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {users.map((user) => (
            <Select.Option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Document Type */}
      <Form.Item
        label="Document Type"
        name="documentType"
        rules={[{ required: true, message: "Please select document type" }]}
      >
        <Select
          placeholder="Select document type"
          onChange={(value) => {
            setDocumentType(value);
            form.setFieldsValue({
              kycDocumentId: undefined,
              complianceItemId: undefined,
            });
          }}
        >
          <Option value="kyc">KYC Document</Option>
          <Option value="compliance">Compliance Document</Option>
        </Select>
      </Form.Item>

      {/* Conditional Fields */}
      {documentType === "kyc" ? (
        <Form.Item
          label="KYC Document"
          name="kycDocumentId"
          rules={[{ required: true, message: "Please select KYC document" }]}
        >
          <Select
            placeholder="Select KYC document"
            showSearch
            optionFilterProp="children"
          >
            {kycDocuments.map((doc) => (
              <Option key={doc._id} value={doc._id}>
                {doc.name} ({doc.code})
              </Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label="Compliance Item"
            name="complianceItemId"
            rules={[
              { required: true, message: "Please select compliance item" },
            ]}
          >
            <Select
              placeholder="Select compliance item"
              showSearch
              optionFilterProp="children"
            >
              {complianceItems.map((item) => (
                <Option key={item._id} value={item._id}>
                  {item.name} ({item.code})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Valid From"
            name="validFrom"
            rules={[
              { required: true, message: "Please select valid from date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </>
      )}

      {/* File Upload */}
      <Form.Item
        label="Upload File"
        required={!editingRecord}
        tooltip="PDF, JPG, PNG (Max 10MB)"
      >
        <Upload {...uploadProps} listType="picture">
          <Button icon={<UploadOutlined />}>
            {fileList.length === 0 ? "Select File" : "Change File"}
          </Button>
        </Upload>
        {!editingRecord && fileList.length === 0 && (
          <div style={{ color: "#ff4d4f", fontSize: 12, marginTop: 4 }}>
            File is required
          </div>
        )}
      </Form.Item>

      {/* Edit-only Fields */}
      {editingRecord && (
        <>
          <Form.Item label="Status" name="status">
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="expired">Expired</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Review Notes" name="reviewNotes">
            <Input.TextArea rows={3} placeholder="Optional notes..." />
          </Form.Item>
        </>
      )}

      {/* Actions */}
      <Form.Item className="form-actions">
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={!editingRecord && fileList.length === 0}
        >
          {editingRecord ? "Update" : "Upload"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DocumentForm;
