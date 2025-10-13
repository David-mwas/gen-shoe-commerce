import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
