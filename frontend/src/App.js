import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
  alpha,
  Slider,
  MenuItem,
  IconButton,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { motion } from 'framer-motion';

axios.defaults.baseURL = 'http://127.0.0.1:3001';

function App() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [numVacancies, setNumVacancies] = useState(20);
  const [region, setRegion] = useState('113');
  const [experience, setExperience] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [originalResults, setOriginalResults] = useState(null);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('none');
  const [regionInput, setRegionInput] = useState('Вся Россия');
  const [showRegions, setShowRegions] = useState(false);
  const [filteredRegions, setFilteredRegions] = useState(regions || []);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const regions = [
    { id: '113', name: 'Вся Россия' },
    { id: '1', name: 'Москва' },
    { id: '2', name: 'Санкт-Петербург' },
    { id: '3', name: 'Екатеринбург' },
    { id: '4', name: 'Новосибирск' },
    { id: '66', name: 'Нижний Новгород' },
    { id: '76', name: 'Ростов-на-Дону' },
    { id: '88', name: 'Красноярск' },
    { id: '104', name: 'Казань' },
    { id: '99', name: 'Уфа' },
    { id: '72', name: 'Воронеж' },
    { id: '54', name: 'Самара' },
    { id: '68', name: 'Тверь' },
    { id: '78', name: 'Саратов' },
    { id: '47', name: 'Ленинградская область' },
    { id: '50', name: 'Московская область' },
    { id: '1118', name: 'Свердловская область' },
    { id: '1119', name: 'Новосибирская область' },
    { id: '1120', name: 'Нижегородская область' },
    { id: '1121', name: 'Ростовская область' },
    { id: '1122', name: 'Красноярский край' },
    { id: '1123', name: 'Республика Татарстан' },
    { id: '1124', name: 'Республика Башкортостан' },
    { id: '1125', name: 'Воронежская область' },
    { id: '1126', name: 'Тверская область' },
    { id: '1127', name: 'Саратовская область' },
    { id: '1128', name: 'Самарская область' },
    { id: '1129', name: 'Республика Крым' },
    { id: '1130', name: 'Краснодарский край' },
    { id: '1131', name: 'Волгоградская область' },
    { id: '1132', name: 'Иркутская область' },
    { id: '1133', name: 'Омская область' },
    { id: '1134', name: 'Томская область' },
    { id: '1135', name: 'Кемеровская область' },
    { id: '1136', name: 'Алтайский край' },
    { id: '1137', name: 'Приморский край' },
    { id: '1138', name: 'Хабаровский край' },
    { id: '1139', name: 'Амурская область' },
    { id: '1140', name: 'Магаданская область' },
    { id: '1141', name: 'Сахалинская область' },
    { id: '1142', name: 'Камчатский край' },
    { id: '1143', name: 'Чукотский автономный округ' },
    { id: '1144', name: 'Республика Саха (Якутия)' },
    { id: '1145', name: 'Республика Бурятия' },
    { id: '1146', name: 'Забайкальский край' },
    { id: '1147', name: 'Республика Тыва' },
    { id: '1148', name: 'Республика Хакасия' },
    { id: '1149', name: 'Республика Алтай' },
    { id: '1150', name: 'Республика Карелия' },
    { id: '1151', name: 'Республика Коми' },
    { id: '1152', name: 'Архангельская область' },
    { id: '1153', name: 'Вологодская область' },
    { id: '1154', name: 'Калининградская область' },
    { id: '1155', name: 'Мурманская область' },
    { id: '1156', name: 'Ненецкий автономный округ' },
    { id: '1157', name: 'Республика Адыгея' },
    { id: '1158', name: 'Республика Калмыкия' },
    { id: '1159', name: 'Республика Северная Осетия — Алания' },
    { id: '1160', name: 'Республика Ингушетия' },
    { id: '1161', name: 'Республика Дагестан' },
    { id: '1162', name: 'Республика Чечня' },
    { id: '1163', name: 'Республика Кабардино-Балкария' },
    { id: '1164', name: 'Республика Карачаево-Черкесия' },
    { id: '1165', name: 'Ставропольский край' },
    { id: '1166', name: 'Республика Марий Эл' },
    { id: '1167', name: 'Республика Мордовия' },
    { id: '1168', name: 'Республика Чувашия' },
    { id: '1169', name: 'Ульяновская область' },
    { id: '1170', name: 'Пензенская область' },
    { id: '1171', name: 'Кировская область' },
    { id: '1172', name: 'Республика Удмуртия' },
    { id: '1173', name: 'Пермский край' },
    { id: '1174', name: 'Оренбургская область' },
    { id: '1175', name: 'Курганская область' },
    { id: '1176', name: 'Челябинская область' },
    { id: '1177', name: 'Тюменская область' },
    { id: '1178', name: 'Ханты-Мансийский автономный округ — Югра' },
    { id: '1179', name: 'Ямало-Ненецкий автономный округ' },
    { id: '1180', name: 'Курская область' },
    { id: '1181', name: 'Белгородская область' },
    { id: '1182', name: 'Липецкая область' },
    { id: '1183', name: 'Тамбовская область' },
    { id: '1184', name: 'Рязанская область' },
    { id: '1185', name: 'Тульская область' },
    { id: '1186', name: 'Калужская область' },
    { id: '1187', name: 'Смоленская область' },
    { id: '1188', name: 'Брянская область' },
    { id: '1189', name: 'Орловская область' },
    { id: '1190', name: 'Костромская область' },
    { id: '1191', name: 'Ивановская область' },
    { id: '1192', name: 'Владимирская область' },
    { id: '1193', name: 'Ярославская область' },
    { id: '1195', name: 'Севастополь' },
  ];

  const experienceOptions = [
    { value: 'all', label: 'Любой опыт' },
    { value: 'noExperience', label: 'Нет опыта' },
    { value: 'between1And3', label: 'От 1 до 3 лет' },
    { value: 'between3And6', label: 'От 3 до 6 лет' },
    { value: 'moreThan6', label: 'Более 6 лет' }
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Пожалуйста, введите поисковый запрос');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setOriginalResults(null);
    setSortOrder('none');
    
    try {
      const response = await axios.post('/api/search', { 
        query,
        num_vacancies: numVacancies,
        region: region,
        experience: experience !== 'all' ? experience : undefined
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else if (response.data.vacancies && response.data.vacancies.length === 0) {
        setError('По вашему запросу вакансий не найдено');
      } else {
        setResults(response.data);
        setOriginalResults(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Ошибка при получении результатов. Пожалуйста, попробуйте еще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNumVacanciesChange = (event, newValue) => {
    setNumVacancies(newValue);
  };

  const handleSort = () => {
    if (!results || !results.vacancies) return;

    const sortedVacancies = [...results.vacancies].sort((a, b) => {
      const getMaxSalary = (vacancy) => {
        if (vacancy.salary_from && vacancy.salary_to) {
          return Math.max(vacancy.salary_from, vacancy.salary_to);
        }
        return vacancy.salary_from || vacancy.salary_to || 0;
      };

      const salaryA = getMaxSalary(a);
      const salaryB = getMaxSalary(b);

      if (sortOrder === 'none') {
        setSortOrder('desc');
        return salaryB - salaryA;
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
        return salaryA - salaryB;
      } else {
        setSortOrder('none');
        return 0;
      }
    });

    setResults({
      ...originalResults,
      vacancies: sortedVacancies
    });
  };

  const handleRegionInputChange = (e) => {
    const inputValue = e.target.value;
    setRegionInput(inputValue);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (regions && regions.length > 0) {
        const filtered = regions.filter(region => 
          region.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredRegions(filtered);
        setShowRegions(true);
      }
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleRegionSelect = (selectedRegion) => {
    setRegion(selectedRegion.id);
    setRegionInput(selectedRegion.name);
    setShowRegions(false);
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.region-selector')) {
      setShowRegions(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        my: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        borderRadius: 4,
        p: 4,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 4
            }}
          >
            Парсер вакансий HH.ru
          </Typography>
        </motion.div>
        
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              label="Введите поисковый запрос"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={loading}
              placeholder="например: Python разработчик"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
            <Box sx={{ position: 'relative', width: '300px' }} className="region-selector">
              <TextField
                fullWidth
                label="Регион"
                variant="outlined"
                value={regionInput}
                onChange={handleRegionInputChange}
                onFocus={() => setShowRegions(true)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setRegionInput('');
                        setRegion('113');
                        setShowRegions(false);
                      }}
                      sx={{ visibility: regionInput ? 'visible' : 'hidden' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
              />
              {showRegions && filteredRegions && filteredRegions.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    mt: 1,
                    borderRadius: 2,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.primary.main,
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: theme.palette.primary.dark,
                    },
                  }}
                >
                  {filteredRegions.map((region) => (
                    <Box
                      key={region.id}
                      onClick={() => handleRegionSelect(region)}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '&:active': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: region.id === '113' ? 'bold' : 'normal',
                          color: region.id === '113' ? theme.palette.primary.main : 'inherit',
                        }}
                      >
                        {region.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        ID: {region.id}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
            <TextField
              select
              label="Опыт работы"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              disabled={loading}
              sx={{
                width: '200px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            >
              {experienceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ width: 200, px: 2 }}>
              <Typography variant="body2" gutterBottom>
                Количество вакансий: {numVacancies}
              </Typography>
              <Slider
                value={numVacancies}
                onChange={handleNumVacanciesChange}
                min={2}
                max={100}
                step={1}
                marks={[
                  { value: 2, label: '2' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' }
                ]}
                valueLabelDisplay="auto"
                disabled={loading}
                sx={{
                  color: theme.palette.primary.main,
                  '& .MuiSlider-thumb': {
                    width: 24,
                    height: 24,
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              {loading ? 'Поиск...' : 'Найти'}
            </Button>
          </Box>
        </Paper>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        )}

        {results && results.vacancies && results.vacancies.length > 0 && (
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
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 3 }}>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Статистика по зарплатам
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(originalResults.statistics.salary_stats).map(([key, value]) => {
                      let vacancyId = null;
                      if (key === 'min' || key === 'max') {
                        const vacancies = originalResults.vacancies;
                        if (key === 'min') {
                          const minVacancy = vacancies.reduce((min, curr) => {
                            const currMin = Math.min(
                              curr.salary_from || Infinity,
                              curr.salary_to || Infinity
                            );
                            return currMin < min.value ? { id: curr.id, value: currMin } : min;
                          }, { id: null, value: Infinity });
                          vacancyId = minVacancy.id;
                        } else {
                          const maxVacancy = vacancies.reduce((max, curr) => {
                            const currMax = Math.max(
                              curr.salary_from || 0,
                              curr.salary_to || 0
                            );
                            return currMax > max.value ? { id: curr.id, value: currMax } : max;
                          }, { id: null, value: 0 });
                          vacancyId = maxVacancy.id;
                        }
                      }

                      return (
                        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: 'text.secondary' }}>
                            {key === 'min' ? 'Минимальная' : 
                             key === 'max' ? 'Максимальная' : 
                             key === 'mean' ? 'Средняя' : 'Медианная'}:
                          </Typography>
                          <Typography sx={{ fontWeight: 'bold' }}>
                            {key === 'mean' ? 
                              Math.round(value).toLocaleString() : 
                              value?.toLocaleString()} ₽
                            {vacancyId && (
                              <a 
                                href={`https://hh.ru/vacancy/${vacancyId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  marginLeft: '8px',
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none',
                                  fontSize: '0.9em',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                [ссылка]
                              </a>
                            )}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Распределение по опыту
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {Object.entries(originalResults.statistics.experience_distribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([exp, count]) => (
                        <Box key={exp} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: 'text.secondary' }}>{exp}</Typography>
                          <Typography sx={{ fontWeight: 'bold' }}>{count}</Typography>
                        </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Топ навыков
                  </Typography>
                  {(() => {
                    const skillCounts = originalResults.statistics.top_skills;
                    const totalVacanciesWithSkills = originalResults.statistics.skills_stats.total_vacancies_with_skills;

                    const topSkillsArray = Object.entries(skillCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10);

                    return (
                      <>
                        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                          Всего вакансий с указанными навыками: {totalVacanciesWithSkills}
                        </Typography>
                        {topSkillsArray.map(([skill, count]) => {
                          const percentage = totalVacanciesWithSkills > 0 ? Math.round((count / totalVacanciesWithSkills) * 100) : 0;
                          return (
                            <Box key={skill} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography sx={{ fontWeight: 'bold' }}>{skill}</Typography>
                                <Typography sx={{ fontWeight: 'bold' }}>{percentage}% ({count})</Typography>
                              </Box>
                              <Box sx={{ 
                                height: 8, 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: 4,
                                overflow: 'hidden'
                              }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  style={{
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </>
                    );
                  })()}
                </Box>
              </Box>
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
                Результаты поиска (найдено {results.vacancies.length} вакансий)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Должность</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Компания</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Зарплата
                        <Tooltip title={sortOrder === 'none' ? 'Сортировать по зарплате' : 
                                      sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}>
                          <IconButton 
                            onClick={handleSort}
                            size="small"
                            sx={{ 
                              ml: 1,
                              color: sortOrder !== 'none' ? theme.palette.primary.main : 'inherit',
                              transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.3s'
                            }}
                          >
                            <SortIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Опыт</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Навыки</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.vacancies.map((vacancy, index) => {
                      console.log('Raw vacancy data:', vacancy);

                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell>
                            <a 
                              href={`https://hh.ru/vacancy/${vacancy.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {vacancy.id}
                            </a>
                          </TableCell>
                          <TableCell>{vacancy.name}</TableCell>
                          <TableCell>
                            {vacancy.employer?.name || 'Не указано'}
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
                          <TableCell>{vacancy.experience}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {Array.isArray(vacancy.key_skills) && vacancy.key_skills.length > 0 ? (
                                vacancy.key_skills.map((skill, i) => (
                                  <Box
                                    key={i}
                                    sx={{
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      color: theme.palette.primary.main,
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1,
                                      fontSize: '0.875rem',
                                      fontWeight: 'medium',
                                      textTransform: 'none',
                                      margin: '2px',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                      },
                                      maxWidth: '200px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={skill.trim()}
                                  >
                                    {skill.trim()}
                                  </Box>
                                ))
                              ) : (
                                <Typography sx={{ color: 'text.secondary' }}>Нет данных</Typography>
                              )}
                            </Box>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        )}
      </Box>
    </Container>
  );
}

export default App; 