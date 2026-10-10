import { Box, Container, Typography, Button, Card } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  People as UsersIcon,
  TrackChanges as TargetIcon,
  EmojiEvents as AwardIcon,
  ArrowForward as ArrowRightIcon,
  AutoAwesome as SparklesIcon,
  School as SchoolIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';
import { useTranslation } from '../i18n/LanguageContext';

export function HomePage() {
  const { t } = useTranslation();
  const featureText = t.home.features;
  const features = [
    {
      icon: <UsersIcon sx={{ fontSize: 32 }} />,
      title: featureText.employees.title,
      description: featureText.employees.description,
      link: '/employees',
      linkText: featureText.employees.link,
      color: '#3b82f6', // blue-500
      bgColor: '#dbeafe', // blue-100
      borderColor: '#3b82f6',
    },
    {
      icon: <TargetIcon sx={{ fontSize: 32 }} />,
      title: featureText.skillProfiles.title,
      description: featureText.skillProfiles.description,
      link: '/skill-profiles',
      linkText: featureText.skillProfiles.link,
      color: '#6366f1', // indigo-600
      bgColor: '#e0e7ff', // indigo-100
      borderColor: '#6366f1',
    },
    {
      icon: <AwardIcon sx={{ fontSize: 32 }} />,
      title: featureText.skills.title,
      description: featureText.skills.description,
      link: '/skills',
      linkText: featureText.skills.link,
      color: '#a855f7', // purple-600
      bgColor: '#f3e8ff', // purple-100
      borderColor: '#a855f7',
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 32 }} />,
      title: featureText.assess.title,
      description: featureText.assess.description,
      link: '/employee-skills',
      linkText: featureText.assess.link,
      color: '#10b981', // emerald-500
      bgColor: '#d1fae5', // emerald-100
      borderColor: '#10b981',
    },
    {
      icon: <GridViewIcon sx={{ fontSize: 32 }} />,
      title: featureText.matrix.title,
      description: featureText.matrix.description,
      link: '/skills-matrix',
      linkText: featureText.matrix.link,
      color: '#f59e0b', // amber-500
      bgColor: '#fef3c7', // amber-100
      borderColor: '#f59e0b',
    },
  ];

  const steps = t.home.steps.map((step, index) => ({ number: String(index + 1), ...step }));

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 10, pb: 8 }}>
        <Box sx={{ textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 1,
              bgcolor: '#dbeafe',
              color: '#1d4ed8',
              borderRadius: '50px',
              mb: 3,
            }}
          >
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SparklesIcon sx={{ fontSize: 18 }} />
              {t.home.badge}
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
              color: '#0f172a',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            {t.home.title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: '#475569',
              fontWeight: 400,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {t.home.intro}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to="/employees"
              variant="contained"
              size="large"
              endIcon={<ArrowRightIcon />}
              sx={{
                bgcolor: '#2563eb',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                },
              }}
            >
              {t.home.getStarted}
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: '12px',
                textTransform: 'none',
                borderWidth: '2px',
                borderColor: '#cbd5e1',
                color: '#475569',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  bgcolor: 'transparent',
                },
              }}
            >
              {t.home.learnMore}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Features Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                p: 4,
                bgcolor: 'white',
                borderTop: `4px solid ${feature.borderColor}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '12px',
                  bgcolor: feature.bgColor,
                  color: feature.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                {feature.icon}
              </Box>
              <Typography variant="h5" sx={{ mb: 2, color: '#0f172a', fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#475569', lineHeight: 1.6 }}>
                {feature.description}
              </Typography>
              <Button
                component={Link}
                to={feature.link}
                endIcon={<ArrowRightIcon />}
                sx={{
                  color: feature.color,
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: feature.color,
                  },
                }}
              >
                {feature.linkText}
              </Button>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Getting Started Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            p: 6,
            color: 'white',
          }}
        >
          <Box sx={{ maxWidth: '800px' }}>
            <Typography variant="h3" sx={{ mb: 4, fontWeight: 700 }}>
              {t.home.gettingStarted}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {steps.map((step) => (
                <Box key={step.number} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    <Typography variant="h6">{step.number}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    <Typography sx={{ color: '#bfdbfe' }}>{step.description}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
