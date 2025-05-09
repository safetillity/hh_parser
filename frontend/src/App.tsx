import React from 'react';
import { Container, Box, Typography, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { store } from './store';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';
import Statistics from './components/Statistics';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Helmet>
            <link rel="icon" type="image/svg+xml" href="/search.svg" />
            <link rel="icon" type="image/png" sizes="32x32" href="/search.svg" />
            <link rel="icon" type="image/png" sizes="16x16" href="/search.svg" />
            <link rel="apple-touch-icon" sizes="180x180" href="/search.svg" />
            <meta property="og:image" content="/search.svg" />
            <meta name="twitter:image" content="/search.svg" />
            <meta name="msapplication-TileImage" content="/search.svg" />
          </Helmet>
          <Box
            sx={{
              minHeight: '100vh',
              py: 4,
              background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
            }}
          >
            <Container maxWidth="lg">
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <Typography variant="h3" component="h1" gutterBottom align="center" color="white">
                  Поиск вакансий
                </Typography>
                <SearchForm />
                <Statistics />
                <SearchResults />
              </Box>
            </Container>
          </Box>
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  );
};

export default App; 