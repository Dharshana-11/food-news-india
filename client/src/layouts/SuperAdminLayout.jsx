import React from "react";
import SideBar from "../components/SideBar";
import ROLES from "../constants/roles";
import Header from "../components/Header";
import { Layout } from "antd";

const { Content } = Layout;

const SuperAdminLayout = ({ children }) => {
  return (
    <div className="super-admin-layout">
      <Header />

      <div className="super-admin-layout-body">
        <SideBar role={ROLES.SUPER_ADMIN} />

        <Content className="main-content">
          {children}
        </Content>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
