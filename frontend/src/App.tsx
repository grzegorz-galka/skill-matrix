import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { SkillProfilesPage } from './pages/SkillProfilesPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillDetailsPage } from './pages/SkillDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/skill-profiles" element={<SkillProfilesPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/:id" element={<SkillDetailsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
