import { createContext } from "react";
import type { IAppService } from "@ui/services/interfaces/IAppService";
import { ApiService } from "@ui/services/implementation/ApiService";
import { AppService } from "@ui/services/implementation/AppService";

export interface IServices {
  appService: IAppService;
}

export const ServicesContext = createContext<IServices | null>(null);

export const ServicesProvider = ServicesContext.Provider;

export function initServices(): IServices {
  const apiService = new ApiService();

  return {
    appService: new AppService(apiService),
  };
}
