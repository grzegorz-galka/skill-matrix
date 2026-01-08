import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeSkillsPage } from './pages/EmployeeSkillsPage';
import { JobProfilesPage } from './pages/JobProfilesPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillDetailsPage } from './pages/SkillDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employee-skills" element={<EmployeeSkillsPage />} />
          <Route path="/job-profiles" element={<JobProfilesPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/skills/:id" element={<SkillDetailsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
