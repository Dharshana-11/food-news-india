import api from "../api/axios";

/**
 * Service Provider → Authorization Documents
 */
const serviceProviderDocumentService = {
  /**
   * Upload authorization document for a service
   * @param {FormData} formData
   */
  uploadDocument: async (formData) => {
    const response = await api.post("/service-provider/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getDocumentViewUrl: (documentId) => {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000";

    return `${baseURL}/api/files/documents/${documentId}`;
  },

  getDocumentDownloadUrl: (documentId) => {
    const baseURL =
      import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5000";

    return `${baseURL}/api/files/documents/${documentId}/download`;
  },
};

export default serviceProviderDocumentService;
