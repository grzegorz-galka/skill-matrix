import { Box, CircularProgress } from '@mui/material';

export function Loading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        padding: 3,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
