import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-style-500 text-secondary-100">
      <NavBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 xs:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
