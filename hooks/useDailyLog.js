import { useState, useEffect, useCallback } from "react";
import { getTodayMeals, getTodayTotals, getWater, saveWater } from "../lib/store";

const TARGETS = {
  target_kcal: 1850, protein_target_g: 150,
  carbs_target_g: 200, fat_target_g: 55,
  fiber_target_g: 30, water_target: 8,
};

export function useDailyLog() {
  const [log, setLog] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);

  const fetchAll = useCallback(() => {
    const totals = getTodayTotals();
    const water = getWater();
    const todayMeals = getTodayMeals();
    setLog({ ...totals, water_glasses: water, targets: TARGETS });
    setMeals(todayMeals);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const setWater = (glasses) => {
    saveWater(glasses);
    setLog((prev) => ({ ...prev, water_glasses: glasses }));
  };

  return { log, meals, loading, error, refetch: fetchAll, setWater };
}
