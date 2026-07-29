import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../lib/AuthContext";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  Store,
  MapPin,
  Phone,
  CheckCircle2,
  Loader2,
  UtensilsCrossed,
  Upload,
} from "lucide-react";
import { host } from "../../lib/Api";

export default function EditRestaurant() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(
        `${host}/api/restaurants/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const restaurant = res.data;

      setForm({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        active: restaurant.status === "active",
      });

      setPreview(restaurant.logo || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load restaurant");
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("address", form.address);
      data.append("phone", form.phone);
      data.append("active", form.active);

      if (imageFile) {
        data.append("logo", imageFile);
      }

      await axios.put(
        `${host}/api/restaurants/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Branch updated successfully");

      navigate("/admin/all-restaurants");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2
          className="animate-spin text-sky-600"
          size={45}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Header */}

        <div className="bg-sky-600 p-10 text-white">
          <h1 className="text-3xl font-black">
            Edit Branch
          </h1>

          <p className="text-sky-100 mt-2">
            Update your restaurant information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-10"
        >

          {/* Logo */}

          <div className="flex flex-col items-center mb-10">

            <label className="relative cursor-pointer group">

              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <div className="w-32 h-32 rounded-[2rem] bg-sky-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">

                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UtensilsCrossed
                    size={50}
                    className="text-sky-300"
                  />
                )}

              </div>

              <div className="absolute -bottom-2 -right-2 bg-sky-600 text-white p-2 rounded-xl border-4 border-white">
                <Upload size={18} />
              </div>

            </label>

            <p className="text-xs mt-4 text-slate-400 font-bold uppercase">
              Click logo to change image
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="space-y-5">

              <div>

                <label className="text-xs font-black uppercase text-slate-400">
                  Restaurant Name
                </label>

                <div className="relative mt-2">

                  <Store
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500"
                    size={18}
                  />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 py-4 bg-slate-50 rounded-2xl border outline-none focus:border-sky-500"
                  />

                </div>

              </div>

              <div>

                <label className="text-xs font-black uppercase text-slate-400">
                  Phone
                </label>

                <div className="relative mt-2">

                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500"
                    size={18}
                  />

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 py-4 bg-slate-50 rounded-2xl border outline-none focus:border-sky-500"
                  />

                </div>

              </div>

            </div>

            <div>

              <label className="text-xs font-black uppercase text-slate-400">
                Address
              </label>

              <div className="relative mt-2">

                <MapPin
                  className="absolute left-4 top-5 text-sky-500"
                  size={18}
                />

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 py-4 bg-slate-50 rounded-2xl border outline-none focus:border-sky-500"
                />

              </div>

            </div>

          </div>

          {/* Status */}

          <div className="mt-10 bg-sky-50 rounded-3xl p-6 flex justify-between items-center flex-wrap gap-5">

            <div className="flex items-center gap-4">

              <div
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    active: !prev.active,
                  }))
                }
                className={`w-14 h-7 rounded-full p-1 cursor-pointer transition ${
                  form.active
                    ? "bg-sky-600"
                    : "bg-slate-300"
                }`}
              >

                <div
                  className={`bg-white w-5 h-5 rounded-full transition-transform ${
                    form.active
                      ? "translate-x-7"
                      : ""
                  }`}
                />

              </div>

              <span className="font-bold text-sm text-slate-600">

                {form.active
                  ? "Branch is Active"
                  : "Branch is Inactive"}

              </span>

            </div>

            <button
              disabled={loading}
              className="px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black flex items-center gap-3 disabled:opacity-70"
            >

              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={20} />
              )}

              {loading
                ? "Updating..."
                : "Update Branch"}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
}