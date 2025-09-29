import { useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Realtime from "./pages/Realtime";

function useAuth() {
  return Boolean(localStorage.getItem("token"));
}

function Protected({ children }: { children: JSX.Element }) {
  const authed = useAuth();
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen palette-bg">
      {/* Navbar */}
      <header className="sticky top-0 z-20 bg-[#EAEBD0]/80 backdrop-blur-xl border-b border-[rgba(175,62,62,0.25)] shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.img
              src="/Files/logo.png"
              alt="Logo"
              className="w-28 md:w-40 h-auto"
              initial={{ rotate: -5, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 120 }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 text-[rgb(80,20,20)] font-medium">
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/predict", label: "Predict" },
              { to: "/realtime", label: "Realtime" },
            ].map((link, idx) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={link.to} className="relative group px-1">
                  {link.label}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-[rgb(175,62,62)] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </header>

      {/* Page Transition */}
      <main className="max-w-6xl mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/predict"
                element={
                  <Protected>
                    <Predict />
                  </Protected>
                }
              />
              <Route
                path="/realtime"
                element={
                  <Protected>
                    <Realtime />
                  </Protected>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ---------- Mobile Menu Component ---------- */
function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        className="p-2 rounded-md border border-[rgba(175,62,62,0.3)]"
        onClick={() => setOpen(!open)}
      >
        <motion.div
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          className="w-6 h-[2px] bg-[rgb(80,20,20)] mb-1 origin-left"
        />
        <motion.div
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          className="w-6 h-[2px] bg-[rgb(80,20,20)] mb-1"
        />
        <motion.div
          animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
          className="w-6 h-[2px] bg-[rgb(80,20,20)] origin-left"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 rounded-lg bg-[#EAEBD0] shadow-lg border border-[rgba(175,62,62,0.2)] p-2 flex flex-col space-y-2"
          >
            <Link
              to="/dashboard"
              className="hover:bg-[rgba(175,62,62,0.1)] rounded px-2 py-1"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/predict"
              className="hover:bg-[rgba(175,62,62,0.1)] rounded px-2 py-1"
              onClick={() => setOpen(false)}
            >
              Predict
            </Link>
            <Link
              to="/realtime"
              className="hover:bg-[rgba(175,62,62,0.1)] rounded px-2 py-1"
              onClick={() => setOpen(false)}
            >
              Realtime
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
