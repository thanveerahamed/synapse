import { BrowserRouter, Routes, Route } from "react-router"
import { AnimatePresence } from "framer-motion"

import { ProtectedRoute, GuestRoute, AdminRoute } from "@/components/RouteGuards"
import Login from "@/pages/Login"
import Home from "@/pages/Home"
import PlayDeck from "@/pages/PlayDeck"
import ManageCards from "@/pages/ManageCards"
import UploadCSV from "@/pages/UploadCSV"

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
          <Route
            path="/deck/:deckId/play"
            element={
              <ProtectedRoute>
                <PlayDeck />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deck/:deckId/manage"
            element={
              <ProtectedRoute>
                <ManageCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-csv"
            element={
              <AdminRoute>
                <UploadCSV />
              </AdminRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
