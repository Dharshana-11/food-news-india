// pages/BusinessTypes/index.jsx
import { useState, useEffect } from "react";
import { Button, Modal, message, Empty } from "antd";
import { PlusOutlined, ShopOutlined } from "@ant-design/icons";

import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import BusinessTypeForm from "./BusinessTypeForm";

import StatsSection from "./components/StatsSection";
import FilterBar from "./components/FilterBar";
import BusinessTypeCard from "./components/BusinessTypeCard";

import { getAllBusinessTypes, deleteBusinessType } from "../../services/businessTypeService";

const { confirm } = Modal;

const BusinessTypes = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ===================== FETCH DATA =====================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBusinessTypes(1, 100);
      setData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      message.error("Failed to load business types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===================== FILTER LOGIC =====================
  useEffect(() => {
    let list = [...data];

    if (searchText) {
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    setFilteredData(list);
  }, [searchText, statusFilter, data]);

  // ===================== HANDLERS =====================
  const handleAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    confirm({
      title: "Delete Business Type?",
      content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteBusinessType(record._id);
          message.success("Business type deleted successfully");
          fetchData();
        } catch (error) {
          message.error("Deletion failed");
        }
      },
    });
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    fetchData();
  };

  // ===================== RENDER =====================
  return (
    <SuperAdminLayout>
      <div className="business-types-page">
        {/* Header */}
        <div className="page-header-section">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-main-title">Business Types</h1>
              <p className="page-subtitle">Manage and organize different food business categories</p>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              className="add-button"
            >
              Add Business Type
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <StatsSection data={data} />

        {/* Filters */}
        <FilterBar
          searchText={searchText}
          setSearchText={setSearchText}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Business Types Grid */}
        <div className="business-types-grid">
          {loading ? (
            <div className="loading-container"><div className="spinner"></div></div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <Empty
                description={
                  searchText
                    ? "No matching business types"
                    : "You haven't added any business types yet"
                }
              />
            </div>
          ) : (
            filteredData.map((bt) => (
              <BusinessTypeCard
                key={bt._id}
                businessType={bt}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Modal */}
        <Modal
          title={
            <div className="modal-title">
              <ShopOutlined style={{ marginRight: 8, color: "var(--color-primary-orange)" }} />
              {editingRecord ? "Edit Business Type" : "Add Business Type"}
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
          footer={null}
          width={600}
          className="business-type-modal"
        >
          <BusinessTypeForm
            editingRecord={editingRecord}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingRecord(null);
            }}
          />
        </Modal>
      </div>
    </SuperAdminLayout>
  );
};

export default BusinessTypes;
