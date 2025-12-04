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

const { Title, Text } = Typography;

const BusinessProfileForm = ({ onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { profile } = await getKYCProfile();
      setProfile(profile);

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
    } catch (error) {
      console.error(error);
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      const payload = {
        ...values,
        fssaiValidityPeriod: values.fssaiValidityPeriod
          ? values.fssaiValidityPeriod.toISOString()
          : undefined,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : undefined,
      };

      Object.keys(payload).forEach((key) => {
        if (!payload[key]) delete payload[key];
      });

      await updateBusinessProfile(payload);
      message.success("Business profile updated successfully!");

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(error);
      message.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 16 }}>Loading profile...</div>
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
      <Title level={3} style={{ marginBottom: 4 }}>
        Business Information
      </Title>
      <Text type="secondary">
        Provide your business details to help us verify your account faster.
      </Text>

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 32 }}
        onFinish={handleSubmit}
      >
        {/* Business Name */}
        <Form.Item
          label="Business Name"
          name="businessName"
          rules={[{ required: true, message: "Business name is required" }]}
        >
          <Input placeholder="Enter business name" size="large" />
        </Form.Item>

        {/* Address */}
        <Form.Item
          label="Registered Address"
          name="registeredAddress"
          rules={[{ required: true, message: "Address is required" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter full business address"
            size="large"
          />
        </Form.Item>

        {/* FSSAI */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="FSSAI License Number" name="fssaiLicenseNumber">
              <Input
                placeholder="14-digit FSSAI license"
                maxLength={14}
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="FSSAI Valid Till" name="fssaiValidityPeriod">
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Category */}
        <Form.Item label="FSSAI Category" name="fssaiCategory">
          <Select placeholder="Select category" allowClear size="large">
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
          <Col span={12}>
            <Form.Item label="GST Number" name="gstNumber">
              <Input
                placeholder="15-digit GST no."
                maxLength={15}
                size="large"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="PAN Number" name="panNumber">
              <Input
                placeholder="10-character PAN"
                maxLength={10}
                size="large"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Aadhaar + DOB */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Aadhaar Number" name="aadhaarNumber">
              <Input placeholder="12-digit Aadhaar" maxLength={12} size="large" />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Stored securely & encrypted
            </Text>
          </Col>

          <Col span={12}>
            <Form.Item label="Date of Birth" name="dateOfBirth">
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Button
          type="primary"
          size="large"
          htmlType="submit"
          loading={saving}
          block
          style={{
            marginTop: 32,
            height: 48,
            borderRadius: 10,
            fontWeight: 600,
          }}
        >
          {saving ? "Saving..." : "Save Business Profile"}
        </Button>
      </Form>
    </Card>
  );
};

export default BusinessProfileForm;
