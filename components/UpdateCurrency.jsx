import React, { useState, useEffect } from "react";
import axios from "axios";
import { host } from "../lib/Api.js";
import { toast } from "react-toastify";
import {useNavigate} from "react-router-dom";

function Currency() {
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const restaurantId = user?.restaurantId;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // =========================
  // FETCH CURRENT RATE
  // =========================
  useEffect(() => {
    const fetchRate = async () => {
      if (!restaurantId) return;

      try {
        const res = await axios.get(
          `${host}/api/rates/${restaurantId}` , {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRate(res.data?.rate || "");
        

      } catch (error) {
        console.log(error.response?.data?.message);
          toast.error(
            error.response?.data?.message || "Something went wrong"
          );
        setRate("");
      }
    };

    fetchRate();
  }, [restaurantId]);

  // =========================
  // UPDATE RATE
  // =========================
  async function updateRate() {
    if (!rate) {
      return toast.error("Please enter a rate");
    }

    try {
      setLoading(true);

      await axios.put(
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

      toast.success("Rate Updated ✅");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error("Update Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Edit Exchange Rate
        </h2>

        <label className="block text-sm font-medium text-gray-600 mb-2">
          Dollar Rate
        </label>

        <input
          type="number"
          placeholder="Enter dollar rate..."
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={updateRate}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Rate"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          This rate is used for currency conversion
        </p>
      </div>
    </div>
  );
}

export default Currency;