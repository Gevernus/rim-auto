import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const Header = ({ user, onLogin, onLogout }) => {
  
  const handleLoginClick = () => {
    const telegramButton = document.querySelector('#telegram-login-button iframe');
    if (telegramButton) {
      telegramButton.click();
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Рим Авто
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Button color="inherit">Найти авто</Button>
          <Button color="inherit">Избранные предложения</Button>
          <Button color="inherit">Сохранённые поиски</Button>
          <Button color="inherit">Мои заказы</Button>
        </Box>
        {user ? (
          <Button variant="contained" onClick={onLogout} sx={{ ml: 2 }}>
            Выйти
          </Button>
        ) : (
          <Button variant="contained" onClick={onLogin || handleLoginClick} sx={{ ml: 2 }}>
            Войти через Telegram
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 