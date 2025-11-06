/**
 * AdminLogin.jsx
 * ----------------
 * Renders the Super Admin login screen.
 * Handles Firebase-based authentication and backend session creation
 * through the AuthContext `login` method.
 *
 * Features:
 * - Responsive design with left image & right login form layout.
 * - Validation for email and password.
 * - Role-based navigation after login.
 * - Graceful error handling and loading indicators.
 */

import { useState } from "react";
import { Form, Input, Button, Typography, Image, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

// import image from "../../assets/compliance_image.png";
// import logoDesktop from "../../assets/placeholder_logo.png";
// import logoMobile from "../../assets/placeholder_logo_dark_theme.png";
import "../../styles/global.css";

import { ROUTES } from "../../routes";
import ROLES from "../../constants/roles";
import BRAND from "../../constants/branding";

const { Text, Link } = Typography;

/**
 * AdminLogin Component
 * ---------------------
 * Handles admin/super admin authentication and redirects user
 * to the appropriate dashboard based on role.
 *
 * @component
 * @returns {JSX.Element} Admin login page UI.
 */
const AdminLogin = () => {
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();
  const { loading, login } = useAuth();

  /**
   * Handles successful form submission.
   * Authenticates user and navigates to the correct dashboard.
   *
   * @async
   * @param {{ identifier: string, password: string }} values - Login form data.
   * @returns {Promise<void>}
   */
  const onFinish = async (values) => {
    setLoadingForm(true);
    try {
      const user = await login(values.identifier, values.password);

      if (!user) {
        message.error("You are not authorized. Please login again.");
        return;
      }

      if (user.role === ROLES.SUPER_ADMIN) {
        message.success(`Welcome ${user.name}!`);
        navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
      } else if (user.role === ROLES.ADMIN) {
        message.success(`Welcome ${user.name}!`);
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        message.warning("Invalid role. Redirecting...");
        navigate(ROUTES.LOGIN);
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="admin-login-container">
      <main className="admin-login-main">
        {/* Top-right logo bar */}
        <div className="admin-login-right-top">
          <div className="admin-login-brand-left">
            <picture>
              <source srcSet={BRAND.LOGO_DARK} media="(max-width: 768px)" />
              <source srcSet={BRAND.LOGO_LIGHT} media="(min-width: 769px)" />
              <img
                src={BRAND.LOGO_LIGHT}
                alt={`${BRAND.NAME} Logo`}
                className="admin-login-brand-logo"
              />
            </picture>

            <h1 className="admin-login-brand-title">
              <span className="admin-login-text-orange">{BRAND.HIGHLIGHT}</span>{" "}
              {BRAND.NAME.replace(`${BRAND.HIGHLIGHT} `, "")}
            </h1>
          </div>

          <div className="admin-login-right-buttons">
            <Button className="admin-login-btn-home">Home</Button>
          </div>
        </div>

        {/* Left illustration */}
        <div className="admin-login-left">
          <Image src={BRAND.IMAGE} preview={false} width={250} />
          <h2
            className="admin-login-slogan"
            style={{ fontFamily: "Poppins", fontWeight: "500" }}
          >
            {BRAND.SLOGAN.split(",")[0]}{" "}
            <span className="admin-login-text-orange">
              {BRAND.SLOGAN.split(",")[1]?.trim().split(" ")[0]}
            </span>
            , <br />
            {BRAND.SLOGAN.split(",")[1]?.trim().split(" ").slice(1).join(" ")}
          </h2>
        </div>

        {/* Right login form */}
        <div className="admin-login-right">
          <div className="admin-login-form-card">
            <h3 className="admin-login-form-card__title">Admin Login</h3>

            <Form layout="vertical" onFinish={onFinish}>
              {/* Email field */}
              <Form.Item
                label="E-mail ID"
                name="identifier"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Enter your email id" />
              </Form.Item>

              {/* Password field */}
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                ]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              {/* Submit button */}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || loadingForm}
                  disabled={loading || loadingForm}
                  block
                  className="admin-login-btn-login"
                >
                  Log In
                </Button>
              </Form.Item>

              {/* Forgot password */}
              <div className="admin-login-form-forgot-password">
                <Text>Forgot Password?</Text>
                <Link href="/" className="admin-login-link-reset-password">
                  {" "}
                  Reset Password
                </Link>
              </div>

              {/* Divider */}
              <div className="admin-login-divider">
                <hr className="admin-login-divider-line" />
                <span className="admin-login-divider-text">OR</span>
                <hr className="admin-login-divider-line" />
              </div>

              {/* Google sign-in (placeholder) */}
              <Form.Item>
                <Button type="default" block className="admin-login-btn-google">
                  <FontAwesomeIcon icon={faGoogle} /> Continue with Google
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
