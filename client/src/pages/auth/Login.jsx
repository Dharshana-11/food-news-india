/**
 * Login.jsx
 * ----------------------------------------------------------------
 * User login using Phone Number + OTP (Firebase Authentication)
 *
 * Steps:
 * 1. User enters phone number
 * 2. Firebase sends OTP
 * 3. User enters OTP
 * 4. Firebase verifies → backend creates session
 * 5. User is redirected based on role
 * ----------------------------------------------------------------
 */
/**
 * Login.jsx - Enhanced
 * ----------------------------------------------------------------
 * Integrated Login + Signup Flow
 *
 * Steps:
 * 1. User enters phone number
 * 2. Firebase sends OTP
 * 3. User enters OTP
 * 4. Backend checks if user exists:
 *    - Existing → Create session → Dashboard
 *    - New → Show profile form (role + name)
 * 5. New user completes profile → Dashboard
 */

import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Image,
  message,
  Space,
  Radio,
} from "antd";
import { UserOutlined, PhoneOutlined, SafetyOutlined } from "@ant-design/icons";
import BRAND from "../../constants/branding";
import ROLES from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../auth/login.css";
import { ROUTES } from "../../routes";

const { Text, Link } = Typography;

const Login = () => {
  const [step, setStep] = useState(0); // 0=phone, 1=OTP, 2=profile
  const [loadingState, setLoadingState] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newUserData, setNewUserData] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { loading, loginWithPhone, verifyOTP, completeProfile } = useAuth();

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 ? `+91${cleaned}` : cleaned;
  };

  // ---------------------------------------------------------------------------
  // Step 1: Send OTP
  // ---------------------------------------------------------------------------
  const handleSendOTP = async (values) => {
    setLoadingState(true);
    try {
      const formatted = formatPhone(values.phone);
      await loginWithPhone(formatted);
      setPhoneNumber(formatted);
      setStep(1);
      message.success("OTP sent successfully!");
    } catch (err) {
      console.error("Send OTP error:", err);
      message.error(err.message || "Failed to send OTP.");
    } finally {
      setLoadingState(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Verify OTP
  // ---------------------------------------------------------------------------
  const handleVerifyOTP = async (values) => {
    setLoadingState(true);
    try {
      const result = await verifyOTP(values.otp);

      if (!result) {
        message.error("Authentication failed.");
        return;
      }

      // New user - show profile form
      if (result.isNewUser) {
        setNewUserData({ uid: result.uid, phone: result.phone });
        setStep(2);
        message.info("Welcome! Please complete your profile.");
        return;
      }

      // Existing user - redirect to dashboard
      const user = result.user;
      navigateToDashboard(user.role);
      message.success(`Welcome back, ${user.name}!`);
    } catch (err) {
      console.error("Verify OTP error:", err);
      message.error(err.message || "Invalid OTP.");
    } finally {
      setLoadingState(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Complete Profile (New Users Only)
  // ---------------------------------------------------------------------------
  const handleCompleteProfile = async (values) => {
    setLoadingState(true);
    try {
      const user = await completeProfile(values.name, values.role);

      navigateToDashboard(user.role);
      message.success(`Welcome, ${user.name}! Your account is ready.`);
    } catch (err) {
      console.error("Profile completion error:", err);
      message.error(err.message || "Failed to complete profile.");
    } finally {
      setLoadingState(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Navigation Helper
  // ---------------------------------------------------------------------------
  const navigateToDashboard = (role) => {
    switch (role) {
      case ROLES.BUSINESS_OWNER:
        navigate(ROUTES.BUSINESS_OWNER_DASHBOARD);
        break;
      case ROLES.AGENT:
        navigate(ROUTES.AGENT_DASHBOARD);
        break;
      case ROLES.SERVICE_PROVIDER:
        navigate(ROUTES.SERVICE_PROVIDER_DASHBOARD);
        break;
      default:
        message.warning("Invalid role. Contact support.");
        navigate(ROUTES.LOGIN);
    }
  };

  // ---------------------------------------------------------------------------
  // Resend OTP
  // ---------------------------------------------------------------------------
  const handleResendOTP = async () => {
    setLoadingState(true);
    try {
      await loginWithPhone(phoneNumber);
      message.success("OTP resent!");
    } catch {
      message.error("Failed to resend OTP.");
    } finally {
      setLoadingState(false);
    }
  };

  const backToPhone = () => {
    setStep(0);
    setNewUserData(null);
    form.resetFields();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="login-container">
      <main className="login-main">
        {/* Header */}
        <div className="login-header">
          <div className="login-brand">
            <picture>
              <source srcSet={BRAND.LOGO_DARK} media="(max-width: 768px)" />
              <source srcSet={BRAND.LOGO_LIGHT} media="(min-width: 769px)" />
              <img
                src={BRAND.LOGO_LIGHT}
                alt={`${BRAND.NAME} Logo`}
                className="login-logo"
              />
            </picture>
            <h1 className="login-brand-title">
              <span className="text-orange">{BRAND.HIGHLIGHT}</span>{" "}
              {BRAND.NAME.replace(`${BRAND.HIGHLIGHT} `, "")}
            </h1>
          </div>
          <Button className="login-btn-home" onClick={() => navigate("/")}>
            Home
          </Button>
        </div>

        {/* Left Panel */}
        <div className="login-left-panel">
          <Image src={BRAND.IMAGE} preview={false} width={250} />
          <h2 className="login-slogan">
            {BRAND.SLOGAN.split(",")[0]}{" "}
            <span className="text-orange">
              {BRAND.SLOGAN.split(",")[1]?.trim().split(" ")[0]}
            </span>
            , <br />
            {BRAND.SLOGAN.split(",")[1]?.trim().split(" ").slice(1).join(" ")}
          </h2>
        </div>

        {/* Right Panel */}
        <div className="login-right-panel">
          <div className="login-form-card">
            {/* Step Indicator */}
            <div className="login-step-indicator">
              <div className={`step ${step === 0 ? "active" : ""}`}>
                <div className="step-circle">
                  <PhoneOutlined />
                </div>
                <span className="step-label">Phone</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step === 1 ? "active" : ""}`}>
                <div className="step-circle">
                  <SafetyOutlined />
                </div>
                <span className="step-label">Verify</span>
              </div>
              {step === 2 && (
                <>
                  <div className="step-line"></div>
                  <div className={`step active`}>
                    <div className="step-circle">
                      <UserOutlined />
                    </div>
                    <span className="step-label">Profile</span>
                  </div>
                </>
              )}
            </div>

            {/* Form Header */}
            <div className="login-form-header">
              <h2 className="login-form-title">
                {step === 0 && "Welcome!"}
                {step === 1 && "Verify OTP"}
                {step === 2 && "Complete Your Profile"}
              </h2>
              <p className="login-form-subtitle">
                {step === 0 && "Enter your mobile number to continue"}
                {step === 1 && `OTP sent to ${phoneNumber}`}
                {step === 2 && "Tell us a bit about yourself"}
              </p>
            </div>

            {/* Step 0: Phone Number */}
            {step === 0 && (
              <Form form={form} layout="vertical" onFinish={handleSendOTP}>
                <Form.Item
                  label="Mobile Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Enter your mobile number" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit number",
                    },
                  ]}
                >
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      value="+91"
                      disabled
                      style={{ width: "80px", textAlign: "center" }}
                    />
                    <Input
                      placeholder="Enter mobile number"
                      maxLength={10}
                      size="large"
                      className="login-input"
                    />
                  </Space.Compact>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || loadingState}
                  block
                  size="large"
                  className="login-btn-primary"
                >
                  Send OTP
                </Button>
              </Form>
            )}

            {/* Step 1: OTP Verification */}
            {step === 1 && (
              <Form form={form} layout="vertical" onFinish={handleVerifyOTP}>
                <Form.Item
                  label="OTP Code"
                  name="otp"
                  rules={[
                    { required: true, message: "Enter the OTP" },
                    { pattern: /^\d{6}$/, message: "OTP must be 6 digits" },
                  ]}
                >
                  <Input.OTP length={6} size="large" autoFocus />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || loadingState}
                  block
                  size="large"
                  className="login-btn-primary"
                >
                  Verify & Continue
                </Button>

                <div className="login-footer-links">
                  <Text>Didn't receive the code? </Text>
                  <Link onClick={handleResendOTP} className="login-link">
                    Resend OTP
                  </Link>
                </div>

                <div className="login-footer-links" style={{ marginTop: 8 }}>
                  <Link onClick={backToPhone} className="login-link-secondary">
                    Change number
                  </Link>
                </div>
              </Form>
            )}

            {/* Step 2: Profile Completion */}
            {step === 2 && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCompleteProfile}
              >
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    { required: true, message: "Enter your name" },
                    {
                      min: 2,
                      message: "Name must be at least 2 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter your full name"
                    size="large"
                    prefix={<UserOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  label="I am a..."
                  name="role"
                  rules={[{ required: true, message: "Select your role" }]}
                >
                  <Radio.Group size="large">
                    <Radio.Button value={ROLES.BUSINESS_OWNER}>
                      Business Owner
                    </Radio.Button>
                    <Radio.Button value={ROLES.AGENT}>Agent</Radio.Button>
                    <Radio.Button value={ROLES.SERVICE_PROVIDER}>
                      Service Provider
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || loadingState}
                  block
                  size="large"
                  className="login-btn-primary"
                >
                  Complete Profile
                </Button>

                <div className="login-footer-links" style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 12, color: "#888" }}>
                    By continuing, you agree to our Terms & Privacy Policy
                  </Text>
                </div>
              </Form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
