
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { SchedulingProvider } from "./context/SchedulingContext";

import AdminLayout from "./layouts/AdminLayout";
import RequestsPage from "./pages/RequestsPage";
import AgendaPage from "./pages/AgendaPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <SchedulingProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to="/admin/solicitacoes"
                replace
              />
            }
          />

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
              <Navigate
                to="/admin/solicitacoes"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </SchedulingProvider>
  );
}
