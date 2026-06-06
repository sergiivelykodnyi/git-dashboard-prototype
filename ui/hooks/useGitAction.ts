import { useState } from "react";
import { useServices } from "@ui/context/ServicesContext";
import type { GitAction } from "@ui/types";

export function useGitAction() {
  const [loading, setLoading] = useState<GitAction | null>(null);
  const { appService } = useServices();

  const execute = async (path: string, action: GitAction, message?: string) => {
    setLoading(action);
    try {
      return await appService.runGitAction(path, action, message);
    } finally {
      setLoading(null);
    }
  };

  return { execute, loading };
}

