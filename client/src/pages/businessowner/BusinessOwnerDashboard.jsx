import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";

const BusinessOwnerDashboard = () => {
  return (
    <AppLayout role={ROLES.BUSINESS_OWNER}>
      <div>businessowner dashboard</div>
    </AppLayout>
  );
};

export default BusinessOwnerDashboard;
