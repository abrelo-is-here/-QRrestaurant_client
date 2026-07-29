import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Loader2, Search, Mail, Store, UserPlus } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { host } from "../../lib/Api";
import { Link } from "react-router-dom";

function Owners() {
  const { token } = useAuth();

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOwners = async () => {
    try {
      const res = await axios.get(`${host}/api/users/owners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOwners(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const deleteOwner = async (id) => {
    if (!window.confirm("Delete this restaurant owner?")) return;

    try {
      setDeleting(id);

      await axios.delete(`${host}/api/users/owners/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOwners(owners.filter((owner) => owner._id !== id));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = owners.filter(
    (owner) =>
      owner.name?.toLowerCase().includes(search.toLowerCase()) ||
      owner.email?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" size={35} />
      </div>
    );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Restaurant Owners
          </h1>

          <p className="text-gray-500 mt-1">Manage restaurant owner accounts</p>
        </div>

        <Link
          to="/admin/create-owners"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-lg transition"
        >
          <UserPlus size={20} />
          Create Owner
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />

            <input
              className="border rounded-lg p-3 pl-10 w-full outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Owner</th>

              <th className="p-4 text-left">Restaurant</th>

              <th className="p-4">Role</th>

              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((owner) => (
              <tr key={owner._id} className="border-t hover:bg-gray-50">
                {/* Owner Info */}
                <td className="p-4">
                  <div className="font-semibold text-slate-900">
                    {owner.name}
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail size={14} />

                    {owner.email}
                  </div>
                </td>

                {/* Restaurant */}
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Store size={16} />

                    {owner.restaurantName || "No restaurant"}
                  </div>
                </td>

                {/* Role */}
                <td className="p-4 text-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    {owner.role}
                  </span>
                </td>

                {/* Action */}
                <td className="p-4 text-center">
                  <button
                    onClick={() => deleteOwner(owner._id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                    title="Delete Owner"
                  >
                    {deleting === owner._id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-500">No owners found.</div>
        )}
      </div>
    </div>
  );
}

export default Owners;
