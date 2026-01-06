
export function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Employee Skills Management System</h1>
      <p style={{ marginTop: '20px', fontSize: '18px' }}>
        Welcome to the Employee Skills Management application. Use the navigation menu to manage:
      </p>
      <ul style={{ fontSize: '16px', lineHeight: '2' }}>
        <li><strong>Employees</strong> - Manage employee information</li>
        <li><strong>Skill Profiles</strong> - Define groups of related skills</li>
        <li><strong>Skills</strong> - Manage individual skills within profiles</li>
      </ul>
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
        <h2>Getting Started</h2>
        <ol>
          <li>Create Skill Profiles to group related skills</li>
          <li>Add Skills to each profile</li>
          <li>Create Employee records</li>
          <li>Assign skill profiles to employees</li>
        </ol>
      </div>
    </div>
  );
}
