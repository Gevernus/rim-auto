import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

const FilterSidebar = ({ filters, onFilterChange, onResetFilters }) => {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <Box sx={{ p: 2, width: 280, borderRight: '1px solid #e0e0e0' }}>
      <Typography variant="h6" gutterBottom>
        Фильтры
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Марка</InputLabel>
        <Select
          name="brandName"
          value={filters.brandName || ''}
          onChange={handleInputChange}
          label="Марка"
        >
          <MenuItem value="">Любая</MenuItem>
          {/* In a real app, these would come from the API */}
          <MenuItem value="Toyota">Toyota</MenuItem>
          <MenuItem value="Honda">Honda</MenuItem>
          <MenuItem value="Ford">Ford</MenuItem>
          <MenuItem value="BMW">BMW</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Модель"
        name="seriesName"
        value={filters.seriesName || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Объем от, л"
        name="volume_from"
        type="number"
        value={filters.volume_from || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
       <TextField
        label="Объем до, л"
        name="volume_to"
        type="number"
        value={filters.volume_to || ''}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" fullWidth sx={{ mt: 2 }}>
        Показать
      </Button>
      <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={onResetFilters}>
        Сбросить всё
      </Button>
    </Box>
  );
};

export default FilterSidebar; 