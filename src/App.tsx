import { BrowserRouter, Routes, Route } from "react-router"
import { AnimatePresence } from "framer-motion"

import { ProtectedRoute, GuestRoute } from "@/components/RouteGuards"
import Login from "@/pages/Login"
import Home from "@/pages/Home"

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
