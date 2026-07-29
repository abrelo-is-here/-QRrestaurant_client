import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { host } from "../lib/Api";

function PopularOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const restaurantId = user?.restaurantId;

  const fetchPopularOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${host}/api/dashboard/popular-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched popular items:", res.data);

      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch popular items:", err);
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) {
      console.log("No restaurantId found.");
      return;
    }

    fetchPopularOrders();

    const socket = io(host);

    socket.emit("joinRestaurant", restaurantId);

    const handleUpdate = () => {
      console.log("Popularity updated");
      fetchPopularOrders();
    };

    socket.on("newOrder", handleUpdate);
    socket.on("orderUpdated", handleUpdate);
    socket.on("orderDeleted", handleUpdate);

    return () => {
      socket.off("newOrder", handleUpdate);
      socket.off("orderUpdated", handleUpdate);
      socket.off("orderDeleted", handleUpdate);
      socket.disconnect();
    };
  }, [restaurantId]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-800">
          🔥 Today's Popular Items
        </h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500">No popular items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {orders.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-xl p-4 border"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold capitalize">
                  {item.name}
                </h3>

                <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs font-bold">
                  TOP {index + 1}
                </span>
              </div>

              <p className="mt-2">
                Sold:{" "}
                <span className="font-bold">
                  {item.quantity}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularOrder;