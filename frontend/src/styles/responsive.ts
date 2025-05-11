import { Theme } from '@mui/material/styles';

export const responsiveStyles = {
  container: {
    padding: (theme: Theme) => ({
      xs: theme.spacing(2),
      sm: theme.spacing(3),
      md: theme.spacing(4)
    }),
    maxWidth: {
      xs: '100%',
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px'
    }
  },
  searchForm: {
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    gap: (theme: Theme) => ({
      xs: theme.spacing(2),
      sm: theme.spacing(3)
    }),
    alignItems: {
      xs: 'stretch',
      sm: 'flex-start'
    }
  },
  searchField: {
    flex: {
      xs: '1 1 auto',
      sm: '1 1 50%'
    }
  },
  regionSelect: {
    flex: {
      xs: '1 1 auto',
      sm: '1 1 30%'
    }
  },
  vacanciesSlider: {
    width: {
      xs: '100%',
      sm: '200px'
    },
    marginTop: {
      xs: 2,
      sm: 0
    }
  },
  resultsTable: {
    '& .MuiTableCell-root': {
      padding: (theme: Theme) => ({
        xs: theme.spacing(1),
        sm: theme.spacing(2)
      })
    }
  },
  statistics: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: '1fr 1fr',
      md: '1fr 1fr 1fr'
    },
    gap: (theme: Theme) => theme.spacing(3)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiCardContent-root': {
      flex: 1
    }
  }
}; 