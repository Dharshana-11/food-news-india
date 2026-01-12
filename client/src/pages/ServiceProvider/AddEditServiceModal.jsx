/**
 * AddEditServiceModal.jsx
 * ============================================================================
 * Reusable modal component for adding or editing a service
 *
 * Props:
 * - visible: boolean - controls modal visibility
 * - onClose: function - callback when modal closes
 * - onSuccess: function - callback when service is successfully saved
 * - editingService: object|null - service to edit (null for add mode)
 * - existingServiceIds: array - IDs of compliance items already added
 */

import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  Upload,
  Button,
  Alert,
  Space,
  Card,
  Typography,
  Divider,
  message,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { getAllComplianceItems } from "../../services/complianceItemService";
import serviceProviderDocumentService from "../../services/serviceProviderDocumentService";
import serviceProviderService from "../../services/serviceProviderService";
import "./AddEditServiceModal.css";

const { Text } = Typography;

const AddEditServiceModal = ({
  visible,
  onClose,
  onSuccess,
  editingService = null,
  existingServiceIds = [],
}) => {
  /* =========================================================================
     State
     ========================================================================= */
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [complianceItems, setComplianceItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileList, setFileList] = useState({});

  const isEditMode = !!editingService;
  const isDraft = editingService?.status === "draft";
  const isRejected = editingService?.status === "rejected";

  /* =========================================================================
     Effects
     ========================================================================= */
  useEffect(() => {
    if (visible) {
      fetchComplianceItems();

      if (editingService?.complianceItemId) {
        setSelectedItem(editingService.complianceItemId);
        form.setFieldsValue({
          complianceItemId: editingService.complianceItemId._id,
          price: editingService.price,
          turnaroundDays: editingService.turnaroundDays,
        });
      } else {
        // Add mode: reset form
        setSelectedItem(null);
        form.resetFields();
      }
      setFileList({});
    }
  }, [visible, editingService]);

  /* =========================================================================
     API Calls
     ========================================================================= */
  const fetchComplianceItems = async () => {
    try {
      const items = await getAllComplianceItems(0, "");
      // Only show active items
      const activeItems = items.filter((item) => item.status === "active");
      setComplianceItems(activeItems);
    } catch (error) {
      console.error("Fetch compliance items error:", error);
      message.error("Failed to load compliance items");
    }
  };

  /* =========================================================================
     Handlers
     ========================================================================= */
  const handleComplianceItemChange = (value) => {
    const item = complianceItems.find((i) => i._id === value);
    setSelectedItem(item);
    setFileList({});
  };

  const handleFileChange = (reqName, info) => {
    setFileList((prev) => ({
      ...prev,
      [reqName]: info.fileList,
    }));
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      let serviceId;

      /**
       * ======================================================
       * STEP 1: Create or Update Service
       * ======================================================
       */
      if (!isEditMode) {
        // Create new service as DRAFT
        const res = await serviceProviderService.createService({
          complianceItemId: values.complianceItemId,
          price: values.price,
          turnaroundDays: values.turnaroundDays,
        });
        serviceId = res.data._id;
      } else {
        // Update existing service
        serviceId = editingService._id;
        await serviceProviderService.updateService(serviceId, {
          price: values.price,
          turnaroundDays: values.turnaroundDays,
        });
      }

      /**
       * ======================================================
       * STEP 2: Upload authorization documents
       * ======================================================
       */
      if (selectedItem?.serviceProviderRequirements?.length > 0) {
        for (const req of selectedItem.serviceProviderRequirements) {
          const files = fileList[req.name];

          // Enforce required docs for new services or draft/rejected resubmission
          if (
            (!isEditMode || isDraft || isRejected) &&
            req.required &&
            (!files || files.length === 0)
          ) {
            message.error(`Please upload ${req.name}`);
            setLoading(false);
            return;
          }

          // Upload if file selected
          if (files && files.length > 0) {
            const formData = new FormData();
            formData.append("file", files[0].originFileObj);
            formData.append("serviceProviderServiceId", serviceId);

            await serviceProviderDocumentService.uploadDocument(formData);
          }
        }
      }

      /**
       * ======================================================
       * STEP 3: Submit for approval (if draft/new)
       * ======================================================
       */
      if (!isEditMode || isDraft) {
        await serviceProviderService.submitForApproval(serviceId);
        message.success("Service submitted for approval");
      } else {
        message.success("Service updated successfully");
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      message.error(error.response?.data?.message || "Failed to save service");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedItem(null);
    setFileList({});
    if (onClose) onClose();
  };

  /* =========================================================================
     Render
     ========================================================================= */
  return (
    <Modal
      title={
        isEditMode
          ? isDraft
            ? "Complete & Submit Service"
            : isRejected
              ? "Fix & Resubmit Service"
              : "Edit Service"
          : "Add New Service"
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
      className="add-edit-service-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Rejection Notice */}
        {isRejected && editingService.adminNotes && (
          <Alert
            type="error"
            message="Service was rejected"
            description={editingService.adminNotes}
            showIcon
            style={{ marginBottom: "1rem" }}
            closable
          />
        )}

        {/* Draft Notice */}
        {isDraft && (
          <Alert
            type="warning"
            message="Service is incomplete"
            description="This service was not fully submitted. Please complete all required documents and submit for approval."
            showIcon
            style={{ marginBottom: "1rem" }}
            closable
          />
        )}

        {/* Service Details Section */}
        <Divider orientation="left">Service Details</Divider>

        <Form.Item
          name="complianceItemId"
          label="Compliance Item"
          rules={[
            { required: true, message: "Please select a compliance item" },
          ]}
          tooltip="This cannot be changed after creation"
        >
          <Select
            placeholder="Select compliance item"
            size="large"
            disabled={isEditMode}
            onChange={handleComplianceItemChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={complianceItems
              .filter((item) =>
                isEditMode
                  ? item._id === editingService.complianceItemId?._id
                  : !existingServiceIds.includes(item._id)
              )
              .map((item) => ({
                value: item._id,
                label: `${item.name} (${item.code})`,
              }))}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Service Price (₹)"
          rules={[
            { required: true, message: "Please enter price" },
            { type: "number", min: 0, message: "Price must be positive" },
          ]}
        >
          <InputNumber
            size="large"
            style={{ width: "100%" }}
            placeholder="Enter price"
            formatter={(value) =>
              `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item
          name="turnaroundDays"
          label="Turnaround Time (Days)"
          rules={[
            { required: true, message: "Please enter turnaround time" },
            { type: "number", min: 1, message: "Must be at least 1 day" },
          ]}
        >
          <InputNumber
            size="large"
            style={{ width: "100%" }}
            placeholder="Enter number of days"
            min={1}
          />
        </Form.Item>

        {/* Authorization Documents Section */}
        {selectedItem?.serviceProviderRequirements?.length > 0 && (
          <>
            <Divider orientation="left">
              Authorization Documents
              <Text
                type="secondary"
                style={{ fontSize: "0.875rem", marginLeft: "0.5rem" }}
              >
                (
                {
                  selectedItem.serviceProviderRequirements.filter(
                    (r) => r.required
                  ).length
                }{" "}
                required)
              </Text>
            </Divider>

            <Alert
              type="info"
              message="Required Documents"
              description="These documents prove your authorization to offer this service. All required documents must be uploaded before submission."
              icon={<InfoCircleOutlined />}
              style={{ marginBottom: "1rem" }}
            />

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {selectedItem.serviceProviderRequirements.map((req, index) => (
                <Card
                  key={index}
                  type="inner"
                  size="small"
                  title={
                    <span>
                      {req.name}
                      {req.required && <span style={{ color: "red" }}> *</span>}
                    </span>
                  }
                  className="add-edit-service-doc-card"
                >
                  {req.description && (
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginBottom: "0.75rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      {req.description}
                    </Text>
                  )}

                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    accept={req.allowedFileTypes?.map((t) => `.${t}`).join(",")}
                    fileList={fileList[req.name] || []}
                    onChange={(info) => handleFileChange(req.name, info)}
                  >
                    <Button icon={<UploadOutlined />}>Select File</Button>
                  </Upload>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "0.75rem",
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    Allowed: {req.allowedFileTypes?.join(", ").toUpperCase()}
                  </Text>
                </Card>
              ))}
            </Space>
          </>
        )}

        {/* Submit */}
        <Divider />
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              {!isEditMode || isDraft || isRejected
                ? "Submit for Approval"
                : "Update Service"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditServiceModal;
