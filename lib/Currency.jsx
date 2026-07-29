import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {host} from './Api'

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [rate, setRate] = useState("");
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const restaurantId = user?.restaurantId
  

 useEffect(() => {
  if (!restaurantId) return;
  const fetchRate = async () => {
    try {
      const res = await axios.get(`${host}/api/rates/${restaurantId}` ,
        { headers: { Authorization: `Bearer ${token}` } });
      setRate(res.data?.rate);
      console.log('objec:' , res.data)
    } catch (err) {
      console.error(err);
      setRate(null);
    }
  };

  fetchRate();
}, [restaurantId]);
  // if (rate === null) {
  //   return <p>Loading currency data...</p>;
  // }
  return (
    <CurrencyContext.Provider value={{ rate }}>
      {children}
    </CurrencyContext.Provider>
  );
};