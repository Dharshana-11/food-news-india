import React from "react";
import { Grid, Badge, Avatar } from "antd";
import { MenuOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

const AppHeader = ({ toggleSidebar }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <header className="flex items-center justify-between bg-[#162247] h-16 px-4 shadow sticky top-0 z-50">
      {/* Hamburger for mobile */}
      {isMobile && (
        <button onClick={toggleSidebar}>
          <MenuOutlined className="text-[#FF6C1F] text-2xl" />
        </button>
      )}

      {/* Brand */}
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-white font-semibold text-xl font-inter">
          <span className="text-[#FF6C1F]">Food</span>{" "}
          <span className="text-white">News India</span>
        </h1>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-4">
        <Badge count={3} color="#FF6C1F">
          <BellOutlined className="text-[#FF6C1F] text-2xl cursor-pointer" />
        </Badge>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          className="cursor-pointer"
        />
      </div>
    </header>
  );
};

export default AppHeader;
