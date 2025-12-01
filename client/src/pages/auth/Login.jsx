/**
 * Login.jsx
 * ------------------------------------------------------------
 * User login screen using Phone Number + OTP (Firebase SMS)
 *
 * Flow:
 * 1. User enters phone number
 * 2. Firebase sends OTP via SMS
 * 3. User enters OTP code
 * 4. Firebase verifies and authenticates
 * 5. Backend creates session
 *
 * UI Features:
 * - Same layout as AdminLogin (left panel + right form)
 * - Enhanced form card with modern UI
 * - Two-step wizard (Phone → OTP)
 * - Resend OTP functionality
 * ------------------------------------------------------------
 */

import { useState } from "react";
import { Form, Input, Button, Typography, Image, message } from "antd";
import { MobileOutlined, SafetyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import "../auth/login.css";
import { ROUTES } from "../../routes";
import ROLES from "../../constants/roles";
import BRAND from "../../constants/branding";

const { Text, Link } = Typography;

/**
 * @component Login
 * @description Phone + OTP authentication for users
 */
const Login = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Phone, 1: OTP
  const [loadingForm, setLoadingForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { loading, loginWithPhone, verifyOTP } = useAuth();

  /**
   * Format phone number to E.164 format (+91XXXXXXXXXX)
   */
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    return cleaned.startsWith("+91") ? cleaned : `+91${cleaned}`;
  };

  /**
   * Step 1: Send OTP to phone
   */
  const handleSendOTP = async (values) => {
    setLoadingForm(true);
    try {
      const formattedPhone = formatPhoneNumber(values.phone);
      
      await loginWithPhone(formattedPhone);
      
      setPhoneNumber(formattedPhone);
      message.success("OTP sent successfully!");
      setCurrentStep(1);
    } catch (error) {
      console.error("Send OTP error:", error);
      message.error(
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoadingForm(false);
    }
  };

  /**
   * Step 2: Verify OTP and create session
   */
  const handleVerifyOTP = async (values) => {
    setLoadingForm(true);
    try {
      const user = await verifyOTP(values.otp);

      if (!user) {
        message.error("Authentication failed. Please try again.");
        return;
      }

      // ✅ Role-based navigation
      switch (user.role) {
        case ROLES.BUSINESS_OWNER:
          message.success(`Welcome ${user.name}!`);
          navigate(ROUTES.BUSINESS_OWNER_DASHBOARD);
          break;
        case ROLES.AGENT:
          message.success(`Welcome ${user.name}!`);
          navigate(ROUTES.AGENT_DASHBOARD);
          break;
        case ROLES.SERVICE_PROVIDER:
          message.success(`Welcome ${user.name}!`);
          navigate(ROUTES.SERVICE_PROVIDER_DASHBOARD);
          break;
        default:
          message.warning("Invalid role. Please contact support.");
          navigate(ROUTES.LOGIN);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      message.error(
        error.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoadingForm(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    setLoadingForm(true);
    try {
      await loginWithPhone(phoneNumber);
      message.success("OTP resent successfully!");
    } catch (error) {
      console.error("Resend OTP error:", error);
      message.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoadingForm(false);
    }
  };

  /**
   * Go back to phone input
   */
  const handleBackToPhone = () => {
    setCurrentStep(0);
    form.resetFields();
  };

  return (
    <div className="login-container">
      <main className="login-main">
        {/* =========================================================
           Header Bar: Logo + Home Button
           ========================================================= */}
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

          <div className="login-header-buttons">
            <Button className="login-btn-home" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>

        {/* =========================================================
           Left Panel: Illustration + Slogan
           ========================================================= */}
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

        {/* =========================================================
           Right Panel: Login Form
           ========================================================= */}
        <div className="login-right-panel">
          <div className="login-form-card">
            {/* Step Indicator */}
            <div className="login-step-indicator">
              <div className={`step ${currentStep >= 0 ? "active" : ""}`}>
                <div className="step-circle">1</div>
                <span className="step-label">Phone</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                <div className="step-circle">2</div>
                <span className="step-label">Verify</span>
              </div>
            </div>

            {/* Form Header */}
            <div className="login-form-header">
              <h2 className="login-form-title">
                {currentStep === 0 ? "Welcome Back!" : "Verify OTP"}
              </h2>
              <p className="login-form-subtitle">
                {currentStep === 0
                  ? "Enter your mobile number to continue"
                  : `We sent a code to ${phoneNumber}`}
              </p>
            </div>

            {/* Forms */}
            {currentStep === 0 ? (
              // ============ STEP 1: PHONE NUMBER ============
              <Form form={form} layout="vertical" onFinish={handleSendOTP}>
                <Form.Item
                  label="Mobile Number"
                  name="phone"
                  rules={[
                    { required: true, message: "Please enter your mobile number!" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Please enter a valid 10-digit mobile number!",
                    },
                  ]}
                >
                  <Input
                    // prefix={<MobileOutlined className="input-icon" />}
                    addonBefore="+91"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    size="large"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading || loadingForm}
                    disabled={loading || loadingForm}
                    block
                    size="large"
                    className="login-btn-primary"
                  >
                    Send OTP
                  </Button>
                </Form.Item>

                {/* Divider */}
                {/* <div className="login-divider">
                  <span className="divider-line"></span>
                  <span className="divider-text">OR</span>
                  <span className="divider-line"></span>
                </div> */}

                {/* Google Sign-In */}
                {/* <Form.Item>
                  <Button
                    type="default"
                    block
                    size="large"
                    className="login-btn-google"
                  >
                    <FontAwesomeIcon icon={faGoogle} /> Continue with Google
                  </Button>
                </Form.Item> */}

                {/* Sign Up Link */}
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
              // ============ STEP 2: OTP VERIFICATION ============
              <Form form={form} layout="vertical" onFinish={handleVerifyOTP}>
                <Form.Item
                  label="OTP Code"
                  name="otp"
                  rules={[
                    { required: true, message: "Please enter the OTP!" },
                    {
                      pattern: /^\d{6}$/,
                      message: "OTP must be 6 digits!",
                    },
                  ]}
                >
                  <Input.OTP
                    length={6}
                    size="large"
                    autoFocus
                    className="otp-box"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading || loadingForm}
                    disabled={loading || loadingForm}
                    block
                    size="large"
                    className="login-btn-primary"
                  >
                    Verify & Login
                  </Button>
                </Form.Item>

                {/* Resend & Change Links */}
                <div className="login-footer-links">
                  <Text>Didn't receive the code? </Text>
                  <Link
                    onClick={handleResendOTP}
                    className="login-link"
                    disabled={loading || loadingForm}
                  >
                    Resend OTP
                  </Link>
                </div>

                <div className="login-footer-links" style={{ marginTop: "8px" }}>
                  <Link
                    onClick={handleBackToPhone}
                    className="login-link-secondary"
                    disabled={loading || loadingForm}
                  >
                    ← Change Phone Number
                  </Link>
                </div>
              </Form>
            )}
          </div>
        </div>
      </main>

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;