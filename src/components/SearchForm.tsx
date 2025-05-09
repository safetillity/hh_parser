import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import { setQuery, setNumVacancies, setRegion } from '../store/searchSlice';
import { RootState } from '../store';
import { regions } from '../constants/regions';
import { responsiveStyles } from '../styles/responsive';

export const SearchForm: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { query, numVacancies, region } = useSelector((state: RootState) => state.search);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuery(event.target.value));
  };

  const handleNumVacanciesChange = (_: Event, value: number | number[]) => {
    dispatch(setNumVacancies(value as number));
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    dispatch(setRegion(event.target.value));
  };

  return (
    <Box sx={responsiveStyles.searchForm}>
      <TextField
        label="Поиск вакансий"
        variant="outlined"
        value={query}
        onChange={handleQueryChange}
        sx={responsiveStyles.searchField}
      />
      
      <FormControl sx={responsiveStyles.regionSelect}>
        <InputLabel>Регион</InputLabel>
        <Select value={region} onChange={handleRegionChange} label="Регион">
          {regions.map(region => (
            <MenuItem key={region.id} value={region.id}>
              {region.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={responsiveStyles.vacanciesSlider}>
        <Typography gutterBottom>
          Количество вакансий: {numVacancies}
        </Typography>
        <Slider
          value={numVacancies}
          onChange={handleNumVacanciesChange}
          min={10}
          max={100}
          step={10}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Button
        variant="contained"
        color="primary"
        size={isMobile ? "large" : "medium"}
        fullWidth={isMobile}
        sx={{ mt: isMobile ? 2 : 0 }}
      >
        Поиск
      </Button>
    </Box>
  );
}; 