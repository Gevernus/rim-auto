import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';

const CarCard = ({ car }) => {
  return (
    <Card sx={{ display: 'flex', mb: 2 }}>
      <CardMedia
        component="img"
        sx={{ width: 250 }}
        image={car.imageUrl}
        alt={car.seriesName}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent>
          <Typography component="div" variant="h5">
            {car.seriesName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" component="div">
            {car.brandName}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {car.price}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default CarCard; 