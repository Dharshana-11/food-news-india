// src/components/ComplianceItemModal.js
import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Select, InputNumber, Button } from "antd";

const { Option } = Select;

/**
 * Modal form for adding or editing a Compliance Item
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Controls modal visibility
 * @param {Function} props.onCancel - Called when modal is cancelled
 * @param {Function} props.onSubmit - Called with form values on submit
 * @param {Object} [props.initialValues] - Initial values for editing
 */
const ComplianceItemModal = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();

  /**
   * Prefill or reset the form when initialValues or visibility changes
   */
  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [initialValues, form, visible]);

  /**
   * Handle OK button click
   * Validates form fields and passes values to onSubmit
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (err) {
      console.error("Validation Failed:", err);
    }
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
          <Input placeholder="Enter item name" />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Please enter item code" }]}
        >
          <Input placeholder="Enter item code" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Validity (Days)"
          name="validityDays"
          rules={[
            { required: true, message: "Please enter validity in days" },
            { type: "number", min: 1, message: "Must be at least 1 day" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
            placeholder="Number of days"
          />
        </Form.Item>

        <Form.Item label="Rule Expression" name="ruleExpression">
          <Input placeholder="e.g., businessType=='Restaurant'" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select placeholder="Select status">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.List name="serviceProviderRequirements">
          {(fields, { add, remove }) => (
            <div className="sp-requirements-section">
              <div className="sp-requirements-header">
                Service Provider Authorization Documents
              </div>

              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="sp-requirement-card">
                  <Form.Item
                    {...restField}
                    label="Document Name"
                    name={[name, "name"]}
                    rules={[{ required: true, message: "Enter document name" }]}
                  >
                    <Input placeholder="e.g. FoSTaC Trainer Certificate" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Description"
                    name={[name, "description"]}
                  >
                    <Input placeholder="Why this document is required" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Required"
                    name={[name, "required"]}
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Allowed File Types"
                    name={[name, "allowedFileTypes"]}
                    initialValue={["pdf", "jpg", "jpeg", "png"]}
                  >
                    <Select mode="multiple" placeholder="Select file types">
                      <Option value="pdf">PDF</Option>
                      <Option value="jpg">JPG</Option>
                      <Option value="jpeg">JPEG</Option>
                      <Option value="png">PNG</Option>
                    </Select>
                  </Form.Item>

                  <div className="sp-requirement-actions">
                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove document
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="dashed" block onClick={() => add()}>
                + Add required document
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ComplianceItemModal;
