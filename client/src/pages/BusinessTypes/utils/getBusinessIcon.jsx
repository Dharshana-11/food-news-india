import {
  CoffeeOutlined,
  ShopOutlined,
  BuildOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  CarOutlined,
} from "@ant-design/icons";

/**
 * Returns an Ant Design icon component corresponding to a business type code.
 *
 * @param {string} code - The business type code (e.g., 'REST', 'PVND')
 * @returns {JSX.Element} - Ant Design icon component
 */
export const getBusinessIcon = (code) => {
  const iconMap = {
    REST: CoffeeOutlined, // Restaurant
    PVND: ShopOutlined, // Petty Vendor
    MFPR: BuildOutlined, // Manufacturing / Processing
    RTEM: ShoppingCartOutlined, // Retailer / E-commerce
    STWH: InboxOutlined, // Storage / Warehouse
    TRDB: CarOutlined, // Transport / Distributor
  };

  const IconComponent = iconMap[code] || ShopOutlined; // default icon
  return <IconComponent />;
};
