"use client";

import { useAuth } from "@crossmint/client-sdk-react-ui";

export function AuthButton() {
  const { login, logout, jwt } = useAuth();

  return !jwt ? (
    <button type="button" onClick={login}>
      Login
    </button>
  ) : (
    <button type="button" onClick={logout}>
      Logout
    </button>
  );
}
