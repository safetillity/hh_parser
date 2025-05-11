import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Paper,
  useTheme,
  alpha,
  Link,
} from '@mui/material';
import { RootState } from '../types';
import { sanitizeInput, sanitizeUrl } from '../utils/sanitize';

const Statistics: React.FC = () => {
  const theme = useTheme();
  const { results } = useSelector((state: RootState) => state.search);

  const statistics = useMemo(() => results?.statistics, [results]);

  if (!results || !statistics) return null;

  const { total_vacancies, salary_stats, experience_distribution, top_skills } = statistics;

  const formatSalary = (value: number | null) => 
    value ? value.toLocaleString() : 'Нет данных';

  const getAverageSalary = (vacancy: any) => {
    if (vacancy.salary_from && vacancy.salary_to) {
      return (vacancy.salary_from + vacancy.salary_to) / 2;
    }
    if (vacancy.salary_from) {
      return vacancy.salary_from;
    }
    if (vacancy.salary_to) {
      return vacancy.salary_to;
    }
    return 0;
  };

  const maxSalaryVacancy = results.vacancies.reduce((max, current) => {
    const currentAvg = getAverageSalary(current);
    const maxAvg = getAverageSalary(max);
    return currentAvg > maxAvg ? current : max;
  }, results.vacancies[0]);

  const minSalaryVacancy = results.vacancies.reduce((min, current) => {
    const currentAvg = getAverageSalary(current);
    const minAvg = getAverageSalary(min);
    return currentAvg < minAvg ? current : min;
  }, results.vacancies[0]);

  const averageSalary = results.vacancies.reduce((sum, vacancy) => sum + getAverageSalary(vacancy), 0) / results.vacancies.length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            background: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom color="primary">
            Средняя зарплата
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {Math.round(averageSalary).toLocaleString()} ₽
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            background: alpha(theme.palette.success.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom color="success.main">
            Максимальная зарплата
          </Typography>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {Math.round(getAverageSalary(maxSalaryVacancy)).toLocaleString()} ₽
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link
                href={sanitizeUrl(`https://hh.ru/vacancy/${maxSalaryVacancy.id}`)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: theme.palette.success.main,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    textDecoration: 'underline',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }
                }}
              >
                {sanitizeInput(maxSalaryVacancy.name)}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {sanitizeInput(maxSalaryVacancy.employer)}
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            height: '100%',
            background: alpha(theme.palette.warning.main, 0.05),
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom color="warning.main">
            Минимальная зарплата
          </Typography>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {Math.round(getAverageSalary(minSalaryVacancy)).toLocaleString()} ₽
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Link
                href={sanitizeUrl(`https://hh.ru/vacancy/${minSalaryVacancy.id}`)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: theme.palette.warning.main,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    textDecoration: 'underline',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }
                }}
              >
                {sanitizeInput(minSalaryVacancy.name)}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {sanitizeInput(minSalaryVacancy.employer)}
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Опыт работы
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(experience_distribution).map(([experience, count]) => (
              <Typography key={experience}>
                {sanitizeInput(experience)}: {count as number} вакансий
              </Typography>
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Typography variant="h6" gutterBottom>
            Топ навыков
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(top_skills).map(([skill, count]) => (
              <Box
                key={skill}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  cursor: 'default',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    maxWidth: '150px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={sanitizeInput(skill)}
                >
                  {sanitizeInput(skill)}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  {count as number}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Statistics; 