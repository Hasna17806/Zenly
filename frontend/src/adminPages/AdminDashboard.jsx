import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  const handleBlock = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/block`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (error) {
      
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard 👑</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Stats Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold">
          Total Users: {users.length}
        </h2>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {user.isBlocked ? (
                    <span className="text-red-500 font-medium">
                      Blocked 🚫
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      Active ✅
                    </span>
                  )}
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleBlock(user._id)}
                    className="bg-yellow-400 px-3 py-1 rounded-lg hover:bg-yellow-500"
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;