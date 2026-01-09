/**
 * ServiceProviderProfileForm.jsx
 * ------------------------------------------------------------
 * Profile form for Service Provider KYC
 * Enforces backend invariants strictly.
 * UI aligned with BusinessProfileForm styles.
 * ------------------------------------------------------------
 */

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Typography,
  message,
  Spin,
  Alert,
} from "antd";
import {
  getKYCProfile,
  updateServiceProviderProfile,
} from "../../services/kyc";

import "./BusinessProfileForm.css"; // reuse SAME styles

const { Title, Text } = Typography;

const ServiceProviderProfileForm = ({ onUpdate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load Service Provider profile + KYC status
   */
  const loadProfile = async () => {
    try {
      const { kycProfile, roleProfile } = await getKYCProfile();

      setKycStatus(kycProfile?.kycStatus);

      if (roleProfile) {
        form.setFieldsValue({
          companyName: roleProfile.companyName,
          description: roleProfile.description,
          location: roleProfile.location,
          contactEmail: roleProfile.contactEmail,
          contactPhone: roleProfile.contactPhone,
          gstNumber: roleProfile.gstNumber,
          businessRegistration: roleProfile.businessRegistration,
        });
      }
    } catch (err) {
      message.error("Failed to load service provider profile");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit profile updates
   */
  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateServiceProviderProfile(values);
      message.success("Service Provider profile saved");
      onUpdate?.();
    } catch (err) {
      message.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // Lock form when KYC is in review or verified
  const isLocked = kycStatus === "in_review" || kycStatus === "verified";

  if (loading) {
    return (
      <div className="profile-form-loading">
        <Spin />
        <span>Loading profile…</span>
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
      <Title level={3}>Service Provider Information</Title>
      <Text type="secondary">
        Complete your business details to proceed with KYC verification.
      </Text>

      {isLocked && (
        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message="Profile locked"
          description="Your profile cannot be edited while KYC is under review or verified."
        />
      )}

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 28 }}
        onFinish={handleSubmit}
        disabled={isLocked}
      >
        {/* Company Name */}
        <Form.Item
          label="Company Name"
          name="companyName"
          rules={[{ required: true, message: "Company name is required" }]}
        >
          <Input size="large" placeholder="Registered company name" />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description" name="description">
          <Input.TextArea
            rows={3}
            size="large"
            placeholder="Brief description of services offered"
          />
        </Form.Item>

        {/* Location */}
        <Form.Item
          label="Operating Location"
          name="location"
          rules={[{ required: true, message: "Location is required" }]}
        >
          <Input size="large" placeholder="City, State" />
        </Form.Item>

        {/* Contact Details */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Contact Email"
              name="contactEmail"
              rules={[
                {
                  type: "email",
                  message: "Enter a valid email address",
                },
              ]}
            >
              <Input size="large" placeholder="business@email.com" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Contact Phone"
              name="contactPhone"
              rules={[
                {
                  pattern: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit phone number",
                },
              ]}
            >
              <Input size="large" placeholder="10-digit mobile number" />
            </Form.Item>
          </Col>
        </Row>

        {/* GST / Registration */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="GST Number" name="gstNumber">
              <Input
                size="large"
                maxLength={15}
                placeholder="15-character GSTIN"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Business Registration ID"
              name="businessRegistration"
            >
              <Input size="large" placeholder="Registration / License number" />
            </Form.Item>
          </Col>
        </Row>

        {/* Backend invariant enforcement */}
        <Form.Item shouldUpdate>
          {() => {
            const email = form.getFieldValue("contactEmail");
            const phone = form.getFieldValue("contactPhone");
            const gst = form.getFieldValue("gstNumber");
            const reg = form.getFieldValue("businessRegistration");

            const contactValid = email || phone;
            const registrationValid = gst || reg;

            if (!contactValid || !registrationValid) {
              return (
                <Alert
                  type="warning"
                  showIcon
                  message="Incomplete information"
                  description="You must provide at least one contact method and one business registration detail."
                />
              );
            }
            return null;
          }}
        </Form.Item>

        {/* Submit */}
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={saving}
          block
          className="business-form-submit-btn"
        >
          {saving ? "Saving..." : "Save Service Provider Profile"}
        </Button>
      </Form>
    </Card>
  );
};

export default ServiceProviderProfileForm;
