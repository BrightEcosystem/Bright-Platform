"use client";

import type { ReactNode } from "react";
import type { AuthContext as AuthContextValue } from "@/types/auth";
import { AuthReactContext } from "@/contexts/auth-context";

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return <AuthReactContext.Provider value={value}>{children}</AuthReactContext.Provider>;
}
