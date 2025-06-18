export const APP_CONFIG = {
    name: 'My React App',
    version: '1.0.0',
    description: 'A well-structured React application',
    author: 'Your Name',
    
    // API Configuration
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
      timeout: 10000,
    },
    
    // App Settings
    settings: {
      theme: 'light',
      language: 'en',
      itemsPerPage: 10,
    },
    
    // Feature Flags
    features: {
      darkMode: true,
      notifications: true,
      analytics: false,
    }
  };