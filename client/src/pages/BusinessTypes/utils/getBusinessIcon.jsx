import {
  CoffeeOutlined,
  ShopOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CarOutlined
} from "@ant-design/icons";

export const getBusinessIcon = (code) => {
  const iconMap = {
    REST: CoffeeOutlined,          // Restaurant
    PVND: ShopOutlined,            // Petty Vendor
    MFPR: BuildOutlined,           // Manufacturing, Processing
    RTEM: ShoppingCartOutlined,    // Retailer, E-commerce
    STWH: InboxOutlined,           // Storage, Warehouse
    TRDB: CarOutlined              // Transport, Distributor
  };

  const IconComponent = iconMap[code] || ShopOutlined;
  return <IconComponent />;
};
