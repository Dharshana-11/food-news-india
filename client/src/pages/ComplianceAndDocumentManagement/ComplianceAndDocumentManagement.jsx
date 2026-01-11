// src/pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement.jsx
import ComplianceItemSummary from "./ComplianceItemSummary";
import BusinessTypeSummary from "./BusinessTypeSummary";
import ComplianceMappingSummary from "./ComplianceMappingSummary";
import KYCDocumentSummary from "./KYCDocumentSummary";
import DocumentSummary from "./DocumentSummary";
import ServiceApprovalSummary from "./ServiceApprovalSummary";

/**
 * ComplianceAndDocumentManagement Page
 *
 * Displays an overview of compliance items, business types, compliance mappings,
 * KYC documents, uploaded documents, and service approvals for the Super Admin.
 */
const ComplianceAndDocumentManagement = () => {
  return (
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
        <ServiceApprovalSummary />
      </div>
    </div>
  );
};

export default ComplianceAndDocumentManagement;
