import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import ComplianceItemSummary from "./ComplianceItemSummary";
import BusinessTypeSummary from "./BusinessTypeSummary";
import ComplianceMappingSummary from "./ComplianceMappingSummary";
import KYCDocumentSummary from "./KYCDocumentSummary";
import DocumentSummary from "./DocumentSummary";

const ComplianceAndDocumentManagement = () => {
  return (
    <SuperAdminLayout>
      <div className="compliance-docs-page">
        <div className="page-header">
          <h2 className="page-title">Compliance & Documents Management</h2>
        </div>

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