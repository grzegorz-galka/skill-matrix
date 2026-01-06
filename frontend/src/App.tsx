import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { SkillProfilesPage } from './pages/SkillProfilesPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillDetailsPage } from './pages/SkillDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav
          style={{
            backgroundColor: '#343a40',
            padding: '1rem 2rem',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to="/"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              Skills Matrix
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link
                to="/employees"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Employees
              </Link>
              <Link
                to="/skill-profiles"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Skill Profiles
              </Link>
              <Link
                to="/skills"
                style={{ color: 'white', textDecoration: 'none' }}
              >
                Skills
              </Link>
            </div>
          </div>
        </nav>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/skill-profiles" element={<SkillProfilesPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/skills/:id" element={<SkillDetailsPage />} />
          </Routes>
        </main>

        <footer
          style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            textAlign: 'center',
            borderTop: '1px solid #dee2e6',
          }}
        >
          <p style={{ margin: 0, color: '#6c757d' }}>
            Employee Skills Management System
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
