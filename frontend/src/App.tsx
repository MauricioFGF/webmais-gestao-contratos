import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './auth/LoginPage';
import { ContractsPage } from './pages/ContractsPage';
import { ContractFormPage } from './pages/ContractFormPage';
import { ClientsPage } from './pages/ClientsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/new" element={<ContractFormPage />} />
            <Route path="/contracts/:id/edit" element={<ContractFormPage />} />
            <Route path="/clients" element={<ClientsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/contracts" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
