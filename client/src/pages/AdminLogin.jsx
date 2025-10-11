import React,{useState} from 'react';
import {Form,Input,Button,message,Typography, Image} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import image from "../assets/compliance_image.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const { Text,Link } = Typography;

const AdminLogin = () => {

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish=async(values)=>{
        console.log('Form Submitted:', values);
        const { email, password } = values;
        setLoading(true);

        try {
      //Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password); //authenticates with Firebase
      const user = userCredential.user;

      //Get Firebase ID token
      const idToken = await user.getIdToken(); //user.getIdToken() - generates JWT token

      //Send token to backend for role verification
      const response = await axios.get("http://localhost:5000/super-admin/dashboard", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      //If backend returns success
      message.success(`Welcome ${response.data.name}!`);
      navigate("/super-admin/dashboard"); // redirect to dashboard

    } catch (error) {
      console.error("Login failed:", error);
      message.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
    }

    const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  }

  return (
//     <div className='bg-secondary flex items-center justify-center flex-col'>
//       <div style={{ backgroundColor: '#162247', height: "220px", width: "100%"}} className='flex items-center justify-center flex-col'>
//         <div className="grid grid-cols-3 gap-4 flex items-center justify-center">
//         <div>
//           <p className="!text-primary">Food News India</p>
//         </div>
//         <div className="color-white">
//           <Button color="primary" variant="text" htmlType='submit'>Home</Button>
//         </div>
//         <div className="text-primary">
//           <Button color="primary" variant="outlined" htmlType='submit'>Sign In</Button>
//         </div>
//       </div>
//       <div>
//         <Image style={{paddingBottom:"10px"}}
//         width={150}
//         src={image}
//         />
//       </div>
//       </div>
      
//   <div className="flex items-center justify-center">
//     <div>
//     <h2 className="">Super Admin Login</h2>
//     <Form layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
//       <Form.Item
//         label="E-mail ID"
//         name="email"
//         rules={[
//           { required: true, message: 'Please enter your email!' },
//           { type: 'email', message: 'Please enter a valid email!' },
//         ]}
//       >
//         <Input placeholder="Enter your email id" />
//       </Form.Item>
//       <Form.Item
//         label="Password"
//         name="password"
//         rules={[{ required: true, message: 'Please enter your password!' }]}
//       >
//         <Input.Password
//           placeholder="Enter your password"
//           iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
//         />
//       </Form.Item>
//       <Form.Item>
//         <Button type="primary" htmlType='submit' loading={loading} block>
//           Log In
//         </Button>
//       </Form.Item>
//       <Form.Item>
//         <Text italic className="color-gray-100">Forgot Password?</Text><Link href="/">  Reset Password</Link>
//       </Form.Item>
//     </Form>
//   </div>
// </div>
// </div>

<div className="flex flex-col min-h-screen">
  {/* Navbar + Image Section */}
  <div
    className="w-full flex flex-col items-center justify-center"
    style={{ backgroundColor: '#162247', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', width:"373px", paddingLeft:"10px",paddingRight:"10px"}}
  >
    {/* Navbar */}
    <div className="w-full max-w-6xl flex items-center justify-between px-6 py-4">
      {/* Website Name */}
      <p>
        <strong><span style={{ color: '#FF6C1F' }}>Food</span>{' '}
        <span style={{ color: '#FFFFFF' }}>News India</span></strong>
      </p>

      {/* Home Button */}
      <Button
        color="primary"
        variant="text"
        htmlType="submit"
        style={{ color: 'white' }}
      >
        Home
      </Button>

      {/* Sign In Button */}
      <Button
        color="primary"
        variant="outlined"
        htmlType="submit"
        style={{ color: '#FF6C1F', borderColor: '#FF6C1F', backgroundColor:"#162247", borderRadius:"10px" }}
      >
        Sign In
      </Button>
    </div>

    {/* Image Section */}
    <div className="flex items-center justify-center py-4">
      <Image width={150} src={image} style={{ paddingBottom: '10px' }} />
    </div>
  </div>

  {/* Super Admin Login Form */}
  <div className="flex flex-1 items-center justify-center px-4 py-8 w-full max-w-4xl">
    <div>
      <h3 className="text-center mb-6">Super Admin Login</h3>
      <Form layout="vertical" onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Form.Item
          label="E-mail ID"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Enter your email id" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password
            placeholder="Enter your password"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>
        <Form.Item style={{paddingBottom:"2px", margin:"0px"}}>
          <Button type="primary" htmlType="submit" loading={loading} block style={{backgroundColor:"#FF6C1F"}}>
            Log In
          </Button>
        </Form.Item>

        <Form.Item className="flex items-center justify-center" style={{marginBottom:"5px"}}>
          <Text italic style={{ color: 'gray' , fontSize:"10px"}}>
            Forgot Password?
          </Text>
          <Link href="/" style={{fontSize:"10px",color:"#162247"}}> Reset Password</Link>
        </Form.Item>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-1 border-gray-300" />
          <span className="px-2 text-gray-400">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Continue with Google */}
        <Form.Item style={{paddingTop:"5px"}}>
          <Button
            type="default"
            block
          >
            <FontAwesomeIcon icon={faGoogle} />
            Continue with Google
          </Button>
        </Form.Item>

        
      </Form>
    </div>
  </div>

  {/* Footer */}
  <div className="w-full" style={{ backgroundColor: '#162247' }}>
    <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center">
      <strong>
      <p style={{ margin:"0px",fontSize:"10px"}}>
        <span style={{ color: '#FF6C1F' }}>Food</span>{' '}
        <span style={{ color: '#FFFFFF' }}>News India</span>
      </p>
      </strong>
      <hr className="w-full border-gray-400 my-4" style={{margin:"4px"}}/>
      <p className="text-white text-center" style={{ margin:"0px",fontSize:"10px", color:"white"}}>© 2025 FoodPoint. All Rights Reserved</p>
    </div>
  </div>
</div>



  )
}

export default AdminLogin