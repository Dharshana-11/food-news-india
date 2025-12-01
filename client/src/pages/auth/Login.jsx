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

import { useState } from "react";
import { Form, Input, Button, Typography, Image, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "../auth/login.css";
import { ROUTES } from "../../routes";
import ROLES from "../../constants/roles";
import BRAND from "../../constants/branding";

const { Text, Link } = Typography;

/**
 * @component Login
 * @description Login screen for Firebase phone-based authentication
 */
const Login = () => {
  const [step, setStep] = useState(0); // 0 = phone, 1 = OTP
  const [loadingState, setLoadingState] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { loading, loginWithPhone, verifyOTP } = useAuth();

  /**
   * Convert phone to E.164 format
   */
  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 10 ? `+91${cleaned}` : cleaned;
  };

  /**
   * Step 1 → Send OTP
   */
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

  /**
   * Step 2 → Verify OTP
   */
  const handleVerifyOTP = async (values) => {
    setLoadingState(true);
    try {
      const user = await verifyOTP(values.otp);

      if (!user) {
        message.error("Authentication failed.");
        return;
      }

      // Role-based navigation
      switch (user.role) {
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

      message.success(`Welcome ${user.name}!`);
    } catch (err) {
      console.error("Verify OTP error:", err);
      message.error(err.message || "Invalid OTP.");
    } finally {
      setLoadingState(false);
    }
  };

  /**
   * Resend OTP
   */
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

  /**
   * Reset to Step 1
   */
  const backToPhone = () => {
    setStep(0);
    form.resetFields();
  };

  return (
    <div className="login-container">
      <main className="login-main">
        {/* ---------------------- Header ---------------------- */}
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

        {/* ---------------------- Left Panel ---------------------- */}
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

        {/* ---------------------- Right Panel ---------------------- */}
        <div className="login-right-panel">
          <div className="login-form-card">
            {/* Step Indicator */}
            <div className="login-step-indicator">
              <div className={`step ${step === 0 ? "active" : ""}`}>
                <div className="step-circle">1</div>
                <span className="step-label">Phone</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step === 1 ? "active" : ""}`}>
                <div className="step-circle">2</div>
                <span className="step-label">Verify</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="login-form-header">
              <h2 className="login-form-title">
                {step === 0 ? "Welcome Back!" : "Verify OTP"}
              </h2>
              <p className="login-form-subtitle">
                {step === 0
                  ? "Enter your mobile number to continue"
                  : `OTP sent to ${phoneNumber}`}
              </p>
            </div>

            {/* ---------------------- Step 1: Phone ---------------------- */}
            {step === 0 ? (
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
                  <Input
                    addonBefore="+91"
                    placeholder="Enter mobile number"
                    maxLength={10}
                    size="large"
                    className="login-input"
                  />
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

                <div className="login-footer-links">
                  <Text>Don't have an account? </Text>
                  <Link
                    onClick={() => navigate(ROUTES.REGISTER)}
                    className="login-link"
                  >
                    Create Account
                  </Link>
                </div>
              </Form>
            ) : (
              /* ---------------------- Step 2: OTP ---------------------- */
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
                  Verify & Login
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
