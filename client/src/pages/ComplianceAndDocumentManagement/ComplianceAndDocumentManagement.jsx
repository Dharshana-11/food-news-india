// src/pages/ComplianceAndDocumentManagement/ComplianceAndDocumentManagement.jsx
import ComplianceItemSummary from "./ComplianceItemSummary";
import BusinessTypeSummary from "./BusinessTypeSummary";
import ComplianceMappingSummary from "./ComplianceMappingSummary";
import KYCDocumentSummary from "./KYCDocumentSummary";
import DocumentSummary from "./DocumentSummary";
import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";

/**
 * ComplianceAndDocumentManagement Page
 *
 * Displays an overview of compliance items, business types, compliance mappings,
 * KYC documents, and uploaded documents for the Super Admin.
 */
const ComplianceAndDocumentManagement = () => {
  return (
    <AppLayout role={ROLES.SUPER_ADMIN}>
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
    </AppLayout>
  );
};

export default ComplianceAndDocumentManagement;
