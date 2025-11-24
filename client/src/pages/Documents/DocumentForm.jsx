// pages/Documents/DocumentForm.jsx
import { useState, useEffect } from "react";
import { Form, Select, DatePicker, Button, message, Upload, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createDocument, updateDocument } from "../../services/documentService";
import { getUsersForDropdown } from "../../services/documentService";
import { getKYCDocumentsForDropdown } from "../../services/kycDocumentService";
import { getComplianceItemsForDropdown } from "../../services/complianceMappingService";

const DocumentForm = ({ editingRecord, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [documentType, setDocumentType] = useState("kyc");

  const [users, setUsers] = useState([]);
  const [kycDocuments, setKycDocuments] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (editingRecord) {
      setDocumentType(editingRecord.kycDocumentId ? "kyc" : "compliance");

      form.setFieldsValue({
        uploadedForUser: editingRecord.uploadedForUser?._id,
        documentType: editingRecord.kycDocumentId ? "kyc" : "compliance",
        kycDocumentId: editingRecord.kycDocumentId?._id,
        complianceItemId: editingRecord.complianceItemId?._id,
        validFrom: editingRecord.validFrom ? dayjs(editingRecord.validFrom) : null,

        // NEW – populate status + reviewNotes during edit
        status: editingRecord.status,
        reviewNotes: editingRecord.reviewNotes,
      });

      // Set existing file
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

  const fetchDropdownData = async () => {
    try {
      const [usersRes, kycRes, complianceRes] = await Promise.allSettled([
        getUsersForDropdown(),
        getKYCDocumentsForDropdown(),
        getComplianceItemsForDropdown(),
      ]);

      const usersData = usersRes.status === "fulfilled" ? usersRes.value : [];
      const kycData = kycRes.status === "fulfilled" ? kycRes.value : [];
      const complianceData = complianceRes.status === "fulfilled" ? complianceRes.value : [];

      setUsers(usersData);
      setKycDocuments(kycData);
      setComplianceItems(complianceData);
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    }
  };

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
          formData.append("validFrom", dayjs(values.validFrom).format("YYYY-MM-DD"));
        }
      }

      // NEW – send status + reviewNotes only in EDIT mode
      if (editingRecord) {
        if (values.status) formData.append("status", values.status);
        if (values.reviewNotes) formData.append("reviewNotes", values.reviewNotes);
      }

      if (editingRecord) {
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

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType = ["application/pdf", "image/jpeg", "image/png"].includes(file.type);
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
          <Select.Option value="kyc">KYC Document</Select.Option>
          <Select.Option value="compliance">Compliance Document</Select.Option>
        </Select>
      </Form.Item>

      {documentType === "kyc" ? (
        <Form.Item
          label="KYC Document"
          name="kycDocumentId"
          rules={[{ required: true, message: "Please select KYC document" }]}
        >
          <Select placeholder="Select KYC document" showSearch optionFilterProp="children">
            {kycDocuments.map((doc) => (
              <Select.Option key={doc._id} value={doc._id}>
                {doc.name} ({doc.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : (
        <>
          <Form.Item
            label="Compliance Item"
            name="complianceItemId"
            rules={[{ required: true, message: "Please select compliance item" }]}
          >
            <Select placeholder="Select compliance item" showSearch optionFilterProp="children">
              {complianceItems.map((item) => (
                <Select.Option key={item._id} value={item._id}>
                  {item.name} ({item.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Valid From"
            name="validFrom"
            rules={[{ required: true, message: "Please select valid from date" }]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </>
      )}

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

      {/* ⭐ NEW – Only show when editing */}
      {editingRecord && (
        <>
          <Form.Item label="Status" name="status">
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
              <Select.Option value="expired">Expired</Select.Option>
              <Select.Option value="trash">Trash</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Review Notes" name="reviewNotes">
            <Input.TextArea rows={3} placeholder="Optional notes..." />
          </Form.Item>
        </>
      )}

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
