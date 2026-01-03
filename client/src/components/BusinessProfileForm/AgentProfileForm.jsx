/**
 * AgentProfileForm.jsx
 * ------------------------------------------------------------
 * Form to display and update the agent profile.
 * Used before KYC document submission.
 * Mirrors BusinessProfileForm styling and UX.
 * ------------------------------------------------------------
 */

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
  Typography,
  message,
  Spin,
} from "antd";
import { getKYCProfile, updateAgentProfile } from "../../services/kyc";
import "./BusinessProfileForm.css";
import { getAllComplianceItems } from "../../services/complianceItemService";
import LANGUAGES from "../../constants/languages";
import INDIAN_STATES from "../../constants/indianStates";

const { Title, Text } = Typography;

const AgentProfileForm = ({ onUpdate }) => {
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
    loadComplianceItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Load existing agent profile
   */
  const loadProfile = async () => {
    try {
      const { profile } = await getKYCProfile();

      if (profile) {
        form.setFieldsValue({
          experience: profile.experience,
          specialization: profile.specialization,
          city: profile.city,
          state: profile.state,
          languages: profile.languages,
          bio: profile.bio,
          commissionRate: profile.commissionRate,
        });
      }
    } catch (err) {
      message.error("Failed to load agent profile");
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceItems = async () => {
    try {
      const items = await getAllComplianceItems(0, "");
      // Optional: filter only active items
      const activeItems = items.filter((item) => item.status === "active");
      setComplianceItems(activeItems);
    } catch (err) {
      message.error("Failed to load compliance items");
    }
  };

  /**
   * Submit agent profile
   */
  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateAgentProfile(values);
      message.success("Profile updated successfully!");
      onUpdate?.();
    } catch (err) {
      message.error("Failed to update profile");
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
      <Title level={3}>Agent Profile</Title>
      <Text type="secondary">
        Tell us about your experience and service area before continuing KYC.
      </Text>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 28 }}
        onFinish={handleSubmit}
      >
        {/* Experience */}
        <Form.Item
          label="Years of Experience"
          name="experience"
          rules={[{ required: true, message: "Experience is required" }]}
        >
          <InputNumber
            size="large"
            min={0}
            style={{ width: "100%" }}
            placeholder="Enter years of experience"
          />
        </Form.Item>

        {/* Commission Rate */}
        <Form.Item
          label="Monthly Commission (₹)"
          name="commissionRate"
          rules={[
            { required: true, message: "Commission rate is required" },
            { type: "number", min: 0, message: "Must be a positive amount" },
          ]}
        >
          <InputNumber
            size="large"
            min={0}
            step={500}
            style={{ width: "100%" }}
            placeholder="Eg: 7500"
            formatter={(value) =>
              `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/[₹,\s]/g, "")}
          />
        </Form.Item>

        {/* Specialization */}
        <Form.Item
          label="Specialization"
          name="specialization"
          rules={[
            { required: true, message: "Select at least one specialization" },
          ]}
        >
          <Select
            mode="multiple"
            size="large"
            placeholder="Select compliance areas you handle"
            loading={!complianceItems.length}
            options={complianceItems.map((item) => ({
              label: item.name,
              value: item.code,
            }))}
          />
        </Form.Item>

        {/* City + State */}
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true, message: "City is required" }]}
            >
              <Input size="large" placeholder="Enter city" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: "State is required" }]}
            >
              <Select
                showSearch
                size="large"
                placeholder="Select state"
                options={INDIAN_STATES.map((state) => ({
                  label: state,
                  value: state,
                }))}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Languages */}
        <Form.Item
          label="Languages Known"
          name="languages"
          rules={[{ required: true, message: "Select at least one language" }]}
        >
          <Select
            mode="multiple"
            size="large"
            placeholder="Select languages you speak"
            options={LANGUAGES.map((lang) => ({
              label: lang,
              value: lang,
            }))}
          />
        </Form.Item>

        {/* Bio */}
        <Form.Item
          label="Professional Bio"
          name="bio"
          rules={[{ max: 500, message: "Bio must be under 500 characters" }]}
        >
          <Input.TextArea
            rows={4}
            size="large"
            placeholder="Short description about your experience"
          />
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
          {saving ? "Saving..." : "Save Agent Profile"}
        </Button>
      </Form>
    </Card>
  );
};

export default AgentProfileForm;
