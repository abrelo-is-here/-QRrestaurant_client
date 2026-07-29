import React, { useState } from "react";
import axios from "axios";
import { host } from "../lib/Api.js";
import { toast } from "react-toastify";

function CreateCurrency() {
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const restaurantId = user?.restaurantId;
  const token = localStorage.getItem("token");

  const createRate = async () => {
    if (!rate) {
      return toast.error("Please enter a rate");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${host}/api/rates/${restaurantId}`,
        {
          rate: Number(rate),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Rate Created Successfully ✅");

      setRate("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create rate ❌";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Exchange Rate
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Dollar Rate
          </label>

          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Enter dollar rate..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={createRate}
          disabled={loading}
          className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Rate"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          This rate will be used for currency conversion.
        </p>
      </div>
    </div>
  );
}

export default CreateCurrency;