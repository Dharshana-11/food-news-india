import { useState } from "react";
import { Form, Input, Button, message, Typography, Image } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import image from "../../assets/compliance_image.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { ROUTES } from "../../routes";

const { Text, Link } = Typography;

// --- Handle form submit ---
const AdminLogin = () => {
  // --- Local states and hooks ---
  const [loadingForm, setLoadingForm] = useState(false);
  const navigate = useNavigate();
  const { loading, login } = useAuth(); // From context (centralized login function)

  // --- When login form is submitted ---
  const onFinish = async (values) => {
    console.log("Form Submitted:", values.identifier);
    setLoadingForm(true);

    try {
      const user = await login(values.identifier, values.password); // Centralized login from context

      // Redirect user based on role
      if (user.role === "super-admin") {
        navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
        message.success(`Welcome ${user.name}!`);
      }
      else if (user.role === "admin") {
        navigate(ROUTES.ADMIN_DASHBOARD);
        message.success(`Welcome ${user.name}!`);
      }
      else navigate(ROUTES.LOGIN)

    } catch (error) {
      console.error("Login failed:", error);
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  // --- Handle validation errors ---
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* ---------------- Header Section ---------------- */}
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{
          backgroundColor: "#162247",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          width: "373px",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        {/* Navbar */}
        <div className="w-full max-w-6xl flex items-center justify-between px-6 py-4">
          {/* Website Name */}
          <p>
            <strong>
              <span style={{ color: "#FF6C1F" }}>Food</span>{" "}
              <span style={{ color: "#FFFFFF" }}>News India</span>
            </strong>
          </p>

          {/* Home Button */}
          <Button
            color="primary"
            variant="text"
            htmlType="submit"
            style={{ color: "white" }}
          >
            Home
          </Button>

          {/* Sign In Button */}
          <Button
            color="primary"
            variant="outlined"
            htmlType="submit"
            style={{
              color: "#FF6C1F",
              borderColor: "#FF6C1F",
              backgroundColor: "#162247",
              borderRadius: "10px",
            }}
          >
            Sign In
          </Button>
        </div>

        {/* Image Section */}
        <div className="flex items-center justify-center py-4">
          <Image width={150} src={image} style={{ paddingBottom: "10px" }} />
        </div>
      </div>

      {/* ---------------- Login Form ---------------- */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 w-full max-w-4xl">
        <div>
          <h3 className="text-center mb-6">Super Admin Login</h3>
          <Form
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
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
            <Form.Item style={{ paddingBottom: "2px", margin: "0px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || loadingForm}
                disabled={loading || loadingForm}
                block
                style={{ backgroundColor: "#FF6C1F" }}
              >
                Log In
              </Button>
            </Form.Item>

            <Form.Item
              className="flex items-center justify-center"
              style={{ marginBottom: "5px" }}
            >
              <Text italic style={{ color: "gray", fontSize: "10px" }}>
                Forgot Password?
              </Text>
              <Link href="/" style={{ fontSize: "10px", color: "#162247" }}>
                {" "}
                Reset Password
              </Link>
            </Form.Item>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-400">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Continue with Google */}
            <Form.Item style={{ paddingTop: "5px" }}>
              <Button type="default" block>
                <FontAwesomeIcon icon={faGoogle} />
                Continue with Google
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="w-full" style={{ backgroundColor: "#162247" }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center">
          <strong>
            <p style={{ margin: "0px", fontSize: "10px" }}>
              <span style={{ color: "#FF6C1F" }}>Food</span>{" "}
              <span style={{ color: "#FFFFFF" }}>News India</span>
            </p>
          </strong>
          <hr
            className="w-full border-gray-400 my-4"
            style={{ margin: "4px" }}
          />
          <p
            className="text-white text-center"
            style={{ margin: "0px", fontSize: "10px", color: "white" }}
          >
            © 2025 FoodPoint. All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
