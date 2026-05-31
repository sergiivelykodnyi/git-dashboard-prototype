import { useCallback, useEffect, useRef } from "react";
import { fetchRepos } from "@ui/api";
import { useAppStore } from "@ui/store";

export function useRepos(intervalMs = 60_000) {
  const { setProjects, setLastRefresh, addLog } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchRepos();
      setProjects(data);
      setLastRefresh();
    } catch {
      addLog("Cannot connect to server — is it running?", "err");
    }
  }, [setProjects, setLastRefresh, addLog]);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, intervalMs]);

  return { refresh };
}
