import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;