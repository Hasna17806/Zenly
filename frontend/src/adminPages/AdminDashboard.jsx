import { useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const { data } = await axios.get(
          "http://localhost:5000/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(data);

      } catch (error) {
        console.log(error.response?.data?.message);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Check console for users data</p>
    </div>
  );
};

export default AdminDashboard;