import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Fetches all vaccine_records for a baby, ordered by administered_at asc.
 *
 * @param {string | null} babyId
 * @returns {{ records: object[], loading: boolean, save: Function }}
 */
export function useVaccineRecords(babyId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!babyId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("vaccine_records")
      .select("*")
      .eq("baby_id", babyId)
      .order("administered_at", { ascending: true });

    setRecords(data ?? []);
    setLoading(false);
  }, [babyId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function save(record) {
    await supabase.from("vaccine_records").insert(record);
    await fetchRecords();
  }

  return { records, loading, save };
}
