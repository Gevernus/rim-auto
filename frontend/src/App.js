import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Header from './components/Header';
import FilterSidebar from './components/FilterSidebar';
import CarCard from './components/CarCard';
import Pagination from '@mui/material/Pagination';
import TelegramLoginWidget from './components/TelegramLoginWidget';

function App() {
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({});

  const fetchCars = () => {
    const params = new URLSearchParams({
      page,
      page_size: pageSize,
      ...filters,
    });
    
    fetch(`/api/cars?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCars(data.data || []);
        setTotal(data.total || 0);
      })
      .catch(error => {
        console.error('Failed to fetch cars:', error);
        setCars([]);
        setTotal(0);
      });
  };

  useEffect(() => {
    fetchCars();
  }, [page, filters]);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };
  
  const handleResetFilters = () => {
    setPage(1);
    setFilters({});
  };

  const handleAuth = (user) => {
    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Authentication failed');
      })
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header user={user} onLogout={handleLogout} />
      <TelegramLoginWidget onAuth={handleAuth} />
      <Container maxWidth="xl" sx={{ display: 'flex', flexGrow: 1, mt: 2 }}>
        <FilterSidebar 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Автомобили с пробегом под заказ из Китая
          </Typography>
          <Grid container spacing={2}>
            {cars.length > 0 ? (
              cars.map(car => (
                <Grid item xs={12} key={car.seriesId}>
                  <CarCard car={car} />
                </Grid>
              ))
            ) : (
              <Typography>No cars found.</Typography>
            )}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={(e, value) => setPage(value)}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default App; 