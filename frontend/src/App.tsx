
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { SchedulingProvider } from "./context/SchedulingContext";

import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import RequestsPage from "./pages/RequestsPage";
import AgendaPage from "./pages/AgendaPage";
import SettingsPage from "./pages/SettingsPage";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";

export default function App() {
  return (
    <SchedulingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="agendar" element={<BookingPage />} />
          </Route>

          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="solicitacoes"
                  replace
                />
              }
            />

            <Route
              path="solicitacoes"
              element={<RequestsPage />}
            />

            <Route
              path="agenda"
              element={<AgendaPage />}
            />

            <Route
              path="configuracoes"
              element={<SettingsPage />}
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
      </BrowserRouter>
    </SchedulingProvider>
  );
}
