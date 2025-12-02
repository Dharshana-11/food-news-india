import AppLayout from "../../layouts/AppLayout";
import ROLES from "../../constants/roles";

const SuperAdminUsers = () => {
  return (
    <div>
      <AppLayout role={ROLES.SUPER_ADMIN}></AppLayout>
    </div>
  );
};

export default SuperAdminUsers;
