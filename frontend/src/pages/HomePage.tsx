import { Container, Typography, Card, CardContent, List, ListItem, ListItemText, Box } from '@mui/material';

export function HomePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Skills Management System
      </Typography>

      <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
        Welcome to the Employee Skills Management application. Use the navigation menu to manage:
      </Typography>

      <List>
        <ListItem>
          <ListItemText
            primary={<strong>Employees</strong>}
            secondary="Manage employee information"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<strong>Skill Profiles</strong>}
            secondary="Define groups of related skills"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<strong>Skills</strong>}
            secondary="Manage individual skills within profiles"
          />
        </ListItem>
      </List>

      <Card sx={{ mt: 5, bgcolor: '#f0f8ff' }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Getting Started
          </Typography>
          <Box component="ol" sx={{ pl: 2 }}>
            <li>Create Skill Profiles to group related skills</li>
            <li>Add Skills to each profile</li>
            <li>Create Employee records</li>
            <li>Assign skill profiles to employees</li>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
