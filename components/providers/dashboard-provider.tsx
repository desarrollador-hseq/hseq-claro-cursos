"use client";

import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { DateRange } from "react-day-picker";
import { Loading } from "../loading";

interface DashboardProps {
  loadingApp: boolean;
  setLoadingApp: Dispatch<SetStateAction<boolean>>;
  date: DateRange | undefined;
  setDate: Dispatch<SetStateAction<DateRange | undefined>>;
  threshold: number | undefined;
}

interface Props {
  children: ReactNode;
}

export const DashboardContext = createContext<DashboardProps>({
  loadingApp: true,
  setLoadingApp: () => {},
  date: undefined,
  setDate: (date) => {},
  threshold: undefined,
});

export const DashboardProvider = ({ children }: Props) => {
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [threshold, setThreshold] = useState<number>();
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    setLoadingApp(false);
  }, []);

  // useEffect(() => {
  //   const getTreshold = async () => {
  //     const { data } = await axios.get("/api/parameters/formation");
  //     setThreshold(data?.threshold || 1);
  //   };
  //   getTreshold();
  // }, []);


  return (
    <DashboardContext.Provider value={{ date, setDate, threshold, loadingApp, setLoadingApp }}>
      {loadingApp ? <Loading /> : children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
