"use client";

import { createContext, useContext } from "react";
import type { AuthContext as AuthContextValue } from "@/types/auth";

export const AuthReactContext = createContext<AuthContextValue | null>(null);

export function useAuthContext(): AuthContextValue | null {
  return useContext(AuthReactContext);
}
