import { useState, useEffect, useCallback } from "react";
import { getDailyLog, getTodayMeals, updateWater } from "../lib/api";

export function useDailyLog() {
  const [log, setLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [logData, mealsData] = await Promise.all([getDailyLog(), getTodayMeals()]);
      setLog(logData);
      setMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setWater = async (glasses) => {
    await updateWater(glasses);
    setLog((prev) => ({ ...prev, water_glasses: glasses }));
  };

  return { log, meals, loading, error, refetch: fetchAll, setWater };
}
