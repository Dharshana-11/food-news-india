import SuperAdminLayout from "../../layouts/SuperAdminLayout";
import { Row, Col, Card, Space} from "antd";

const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
      <div className="super-admin-dashboard">
        
        <Row gutter={[24,24]} className="dashboard-row">
          <Col span={6}> <Card title="Total Businesses">123</Card> </Col>
          <Col span={6}> <Card title="Agents">123</Card> </Col>
          <Col span={6}> <Card title="Service Providers">123</Card> </Col>
          <Col span={6}> <Card title="Open Tickets">123</Card> </Col>
        </Row>

        <Row gutter={[24,24]} className="dashboard-row">
          <Col span={8} > 
            <Card title="Compliance Overview" style={{ marginBottom: "24px" }}>[Chart Placeholder]</Card> 
            <Card title="Pending Verfications">[Table Placeholder]</Card> 
          </Col>
          <Col span={16}> <Card title="Activity Chart" style={{ height: "100%" }}>[Chart Placeholder]</Card></Col>
        </Row>

        <Row gutter={[24,24]} className="dashboard-row">
          <Col span={8}> <Card title="Service Summary">123</Card> </Col>
          <Col span={8}> <Card title="Ticktes Snapshot">123</Card> </Col>
          <Col span={8}> <Card title="Notifications">123</Card> </Col>
        </Row>
    </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
