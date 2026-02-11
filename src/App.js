import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SuperAdmin from "./pages/SuperAdmin";
import Admin from "./pages/Admin";
import Client from "./pages/Client";
import Customer from "./pages/Customer";
import MatkaLayout from "./pages/matka/MatkaLayout";
import ProtectedRoute from "./components/ProtectedRoute";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SuperAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/*"
          element={
            <ProtectedRoute role="CLIENT">
              <Client />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/*"
          element={
            <ProtectedRoute role="CUSTOMER">
              <Customer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/matka/*"
          element={
            <ProtectedRoute role="CUSTOMER">
              <MatkaLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
