// src/pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement.jsx
import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import ComplianceItemSummary from "./ComplianceItemSummary";
import BusinessTypeSummary from "./BusinessTypeSummary";
import ComplianceMappingSummary from "./ComplianceMappingSummary";
import KYCDocumentSummary from "./KYCDocumentSummary";
import DocumentSummary from "./DocumentSummary";

/**
 * ComplianceAndDocumentManagement Page
 *
 * Displays an overview of compliance items, business types, compliance mappings,
 * KYC documents, and uploaded documents for the Super Admin.
 */
const ComplianceAndDocumentManagement = () => {
  return (
    <SuperAdminLayout>
      <div className="compliance-docs-page">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-title">Compliance & Documents Management</h2>
        </div>

        {/* Summaries Grid */}
        <div className="summaries-grid">
          <ComplianceItemSummary />
          <BusinessTypeSummary />
          <ComplianceMappingSummary />
          <KYCDocumentSummary />
          <DocumentSummary />
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ComplianceAndDocumentManagement;
