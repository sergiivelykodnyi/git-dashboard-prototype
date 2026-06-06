import { useCallback, useEffect, useRef } from "react";
import { useServices } from "@ui/context/ServicesContext";

export function useRepos(intervalMs = 60_000) {
  const { appService } = useServices();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      await appService.fetchRepos();
    } catch {
      // appService.fetchRepos already logs errors
    }
  }, [appService]);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, intervalMs]);

  return { refresh };
}

