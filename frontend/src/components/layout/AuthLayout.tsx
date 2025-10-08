import React from "react";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  // simple centered container for auth pages — no header/footer
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
