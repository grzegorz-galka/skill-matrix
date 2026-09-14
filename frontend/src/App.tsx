import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { AuthProvider } from './auth/AuthProvider';
import { OidcCallback } from './auth/OidcCallback';
import { HomePage } from './pages/HomePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeSkillsPage } from './pages/EmployeeSkillsPage';
import { SkillProfilesPage } from './pages/SkillProfilesPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillDetailsPage } from './pages/SkillDetailsPage';
import { SkillsMatrixPage } from './pages/SkillsMatrixPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/auth/callback" element={<OidcCallback />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employee-skills" element={<EmployeeSkillsPage />} />
            <Route path="/skill-profiles" element={<SkillProfilesPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/skills/:id" element={<SkillDetailsPage />} />
            <Route path="/skills-matrix" element={<SkillsMatrixPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
