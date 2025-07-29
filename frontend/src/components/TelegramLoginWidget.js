import React, { useEffect } from 'react';

const TelegramLoginWidget = ({ onAuth }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'YOUR_TELEGRAM_BOT_NAME'); // Replace with your bot name
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    const buttonContainer = document.getElementById('telegram-login-button');
    if (buttonContainer) {
      buttonContainer.appendChild(script);
    }
    
    return () => {
      // Cleanup
      window.onTelegramAuth = null;
    };
  }, [onAuth]);

  return <div id="telegram-login-button" style={{ display: 'none' }} />;
};

export default TelegramLoginWidget; 