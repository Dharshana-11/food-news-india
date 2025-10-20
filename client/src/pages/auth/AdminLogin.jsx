import { useState } from "react";
import { Form, Input, Button, Typography, Image, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import image from "../../assets/compliance_image.png";
import logoDesktop from "../../assets/placeholder_logo.png";
import logoMobile from "../../assets/placeholder_logo_dark_theme.png";
import "../../styles/global.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ROUTES } from "../../routes";

const { Text, Link } = Typography;

const AdminLogin = () => {
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();
  const { loading, login } = useAuth();

  const onFinish = async (values) => {
    setLoadingForm(true);
    try {
      const user = await login(values.identifier, values.password);
      if (user.role === "super-admin") navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
      else if (user.role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
      else navigate(ROUTES.LOGIN);
      message.success(`Welcome ${user.name}!`);
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="admin-login-container">
      <main className="admin-login-main">
        {/* RIGHT-TOP FIRST */}
        <div className="admin-login-right-top">
          <div className="admin-login-brand-left">
            <picture>
              <source srcSet={logoMobile} media="(max-width: 768px)" />
              <source srcSet={logoDesktop} media="(min-width: 769px)" />
              <img
                src={logoDesktop}
                alt="Food News India Logo"
                className="admin-login-brand-logo"
              />
            </picture>
            <h1 className="admin-login-brand-title">
              <span className="admin-login-text-orange">Food</span> News India
            </h1>
          </div>
          <div className="admin-login-right-buttons">
            <Button className="admin-login-btn-home">Home</Button>
          </div>
        </div>

        {/* LEFT SECTION */}
        <div className="admin-login-left">
          <Image src={image} preview={false} width={250} />
          <h2
            className="admin-login-slogan"
            style={{ fontFamily: "Poppins", fontWeight: "500" }}
          >
            Simplify <span className="admin-login-text-orange">Compliance</span>
            , <br />
            Empower Your Business
          </h2>
        </div>

        {/* RIGHT (FORM) */}
        <div className="admin-login-right">
          <div className="admin-login-form-card">
            <h3 className="admin-login-form-card__title">Super Admin Login</h3>

            <Form layout="vertical" onFinish={onFinish}>
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

              <div className="admin-login-form-forgot-password">
                <Text>Forgot Password?</Text>
                <Link href="/" className="admin-login-link-reset-password">
                  {" "}
                  Reset Password
                </Link>
              </div>

              <div className="admin-login-divider">
                <hr className="admin-login-divider-line" />
                <span className="admin-login-divider-text">OR</span>
                <hr className="admin-login-divider-line" />
              </div>

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
