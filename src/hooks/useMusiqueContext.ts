import { MusiqueContextValueType } from "@/context/musique-context";
import { createContext, useContext } from "react";

export const MusiqueContext = createContext<
  MusiqueContextValueType | undefined
>(undefined);

export const useMusique = () => {
  const context = useContext(MusiqueContext);

  if (!context) {
    throw new Error("useMusique must be within MusiqueProvider");
  }

  return context;
};
