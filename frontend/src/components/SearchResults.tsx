import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
  alpha,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { RootState } from '../types';
import { Vacancy } from '../types';
import Statistics from './Statistics';
import { sanitizeInput, sanitizeUrl } from '../utils/sanitize';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type SortDirection = 'asc' | 'desc' | null;

const SearchResults: React.FC = () => {
  const theme = useTheme();
  const { results, loading, error } = useSelector(
    (state: RootState) => state.search
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const vacancies = useMemo(() => {
    const baseVacancies = results?.vacancies || [];
    if (!sortDirection) return baseVacancies;

    return [...baseVacancies].sort((a, b) => {
      const getAverageSalary = (vacancy: Vacancy) => {
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

      const aSalary = getAverageSalary(a);
      const bSalary = getAverageSalary(b);

      return sortDirection === 'asc' ? aSalary - bSalary : bSalary - aSalary;
    });
  }, [results?.vacancies, sortDirection]);

  const handleSort = () => {
    setSortDirection(current => {
      if (current === null) return 'desc';
      if (current === 'desc') return 'asc';
      return null;
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
        {sanitizeInput(error)}
      </Alert>
    );
  }

  if (!results || vacancies.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        По вашему запросу вакансий не найдено
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Статистика
        </Typography>
        <Statistics />
      </Paper>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 3
          }}
        >
          Результаты поиска (найдено {vacancies.length} вакансий)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Должность</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Компания</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      color: theme.palette.primary.main,
                    }
                  }}
                  onClick={handleSort}
                  >
                    Зарплата
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: sortDirection ? theme.palette.primary.main : 'inherit',
                      bgcolor: sortDirection ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}>
                      {sortDirection === 'desc' ? (
                        <>
                          <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">По убыванию</Typography>
                        </>
                      ) : sortDirection === 'asc' ? (
                        <>
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">По возрастанию</Typography>
                        </>
                      ) : (
                        <>
                          <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">Сортировать</Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Опыт</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Навыки</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vacancies.map((vacancy: Vacancy, index: number) => (
                <motion.tr
                  key={vacancy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TableCell>
                    <Box
                      component="a"
                      href={sanitizeUrl(`https://hh.ru/vacancy/${vacancy.id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {sanitizeInput(vacancy.id)}
                    </Box>
                  </TableCell>
                  <TableCell>{sanitizeInput(vacancy.name)}</TableCell>
                  <TableCell>
                    <Box
                      component="a"
                      href={sanitizeUrl(`https://hh.ru/employer/${vacancy.employer_id}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {sanitizeInput(vacancy.employer)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {vacancy.salary_from && vacancy.salary_to 
                      ? `${vacancy.salary_from.toLocaleString()} - ${vacancy.salary_to.toLocaleString()} ₽`
                      : vacancy.salary_from 
                        ? `от ${vacancy.salary_from.toLocaleString()} ₽`
                        : vacancy.salary_to 
                          ? `до ${vacancy.salary_to.toLocaleString()} ₽`
                          : 'Не указана'}
                  </TableCell>
                  <TableCell>{sanitizeInput(vacancy.experience)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {vacancy.key_skills.map((skill, index) => (
                        <Box
                          key={index}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          {sanitizeInput(skill)}
                        </Box>
                      ))}
                    </Box>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
};

export default SearchResults; 