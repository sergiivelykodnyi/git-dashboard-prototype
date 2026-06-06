import { createContext, useContext } from "react";
import type { IAppService } from "@ui/services/interfaces/IAppService";
import { ApiService } from "@ui/services/implementation/ApiService";
import { AppService } from "@ui/services/implementation/AppService";

export interface IServices {
  appService: IAppService;
}

const ServicesContext = createContext<IServices | null>(null);

export const ServicesProvider = ServicesContext.Provider;

export function useServices() {
  const services = useContext(ServicesContext);

  if (!services)
    throw new Error("useServices must be used within ServicesContext");

  return services;
}

export function initServices(): IServices {
  const apiService = new ApiService();

  return {
    appService: new AppService(apiService),
  };
}
