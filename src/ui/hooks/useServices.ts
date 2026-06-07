import { useContext } from "react";
import { ServicesContext } from "@ui/context/ServicesContext";
import type { IServices } from "@ui/context/ServicesContext";


export function useServices(): IServices {
  const services = useContext(ServicesContext);

  if (!services)
    throw new Error("useServices must be used within ServicesContext");

  return services;
}
