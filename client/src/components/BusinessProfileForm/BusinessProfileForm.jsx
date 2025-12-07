/**
 * BusinessProfileForm.jsx
 * ------------------------------------------------------------
 * Form to display and update the business profile.
 * Fetches KYC profile on mount and allows editing fields.
 * Uses Ant Design components for layout and validation.
 * ------------------------------------------------------------
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Button,
  Typography,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { getKYCProfile, updateBusinessProfile } from "../../services/kyc";
import "./BusinessProfileForm.css";

const { Title, Text } = Typography;

/**
 * BusinessProfileForm component
 *
 * @param {Object} props
 * @param {Function} props.onUpdate - Callback triggered after successful profile update
 */
const BusinessProfileForm = ({ onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Loads business profile from backend and populates form fields
   */
  const loadProfile = async () => {
    try {
      const { profile } = await getKYCProfile();

      if (profile) {
        form.setFieldsValue({
          businessName: profile.businessName,
          registeredAddress: profile.registeredAddress,
          businessTypeId: profile.businessTypeId?._id,
          fssaiLicenseNumber: profile.fssaiLicenseNumber,
          fssaiValidityPeriod: profile.fssaiValidityPeriod
            ? dayjs(profile.fssaiValidityPeriod)
            : null,
          fssaiCategory: profile.fssaiCategory,
          gstNumber: profile.gstNumber,
          panNumber: profile.panNumber,
          aadhaarNumber: profile.aadhaarNumber,
          dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
        });
      }
    } catch (err) {
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles form submission and updates business profile
   *
   * @param {Object} values - Form values
   */
  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      const payload = {
        ...values,
        fssaiValidityPeriod: values.fssaiValidityPeriod?.toISOString(),
        dateOfBirth: values.dateOfBirth?.toISOString(),
      };

      await updateBusinessProfile(payload);
      message.success("Profile updated successfully!");
      onUpdate?.();
    } catch (err) {
      message.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 12 }}>Loading...</div>
      </div>
    );
  }

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <Title level={3}>Business Information</Title>
      <Text type="secondary">
        Provide your business details to verify your account faster.
      </Text>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 28 }}
        onFinish={handleSubmit}
      >
        {/* Business Name */}
        <Form.Item
          label="Business Name"
          name="businessName"
          rules={[{ required: true, message: "Business name is required" }]}
        >
          <Input size="large" placeholder="Enter business name" />
        </Form.Item>

        {/* Registered Address */}
        <Form.Item
          label="Registered Address"
          name="registeredAddress"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea
            rows={3}
            size="large"
            placeholder="Enter full address"
          />
        </Form.Item>

        {/* FSSAI License Number + Validity */}
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="FSSAI License Number" name="fssaiLicenseNumber">
              <Input
                maxLength={14}
                size="large"
                placeholder="14-digit license"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="FSSAI Valid Till" name="fssaiValidityPeriod">
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* FSSAI Category */}
        <Form.Item label="FSSAI Category" name="fssaiCategory">
          <Select size="large" allowClear placeholder="Select category">
            <Select.Option value="manufacturer">Manufacturer</Select.Option>
            <Select.Option value="distributor">Distributor</Select.Option>
            <Select.Option value="retailer">Retailer</Select.Option>
            <Select.Option value="restaurant">Restaurant/Hotel</Select.Option>
            <Select.Option value="importer">Importer</Select.Option>
            <Select.Option value="transporter">Transporter</Select.Option>
          </Select>
        </Form.Item>

        {/* GST + PAN */}
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="GST Number" name="gstNumber">
              <Input size="large" maxLength={15} placeholder="15-char GST" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="PAN Number" name="panNumber">
              <Input size="large" maxLength={10} placeholder="10-char PAN" />
            </Form.Item>
          </Col>
        </Row>

        {/* Aadhaar + Date of Birth */}
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="Aadhaar Number" name="aadhaarNumber">
              <Input
                size="large"
                maxLength={12}
                placeholder="12-digit Aadhaar"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Form.Item label="Date of Birth" name="dateOfBirth">
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Submit Button */}
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={saving}
          block
          className="business-form-submit-btn"
        >
          {saving ? "Saving..." : "Save Business Profile"}
        </Button>
      </Form>
    </Card>
  );
};

export default BusinessProfileForm;
