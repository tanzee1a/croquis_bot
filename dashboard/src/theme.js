// src/theme.js

import { extendTheme } from '@chakra-ui/react';

// Define your custom color palette
const colors = {
  brand: {
    bg: '#FFF9BD',
    grid: '#A3DC9A',
    primary: '#DEE791',
    secondary: '#FFD6BA',
  },
};

// Define the global styles, including the background pattern
const styles = {
  global: {
    'body': {
      backgroundColor: 'brand.bg',
      backgroundImage: `linear-gradient(var(--chakra-colors-brand-grid) 1px, transparent 1px), linear-gradient(to right, var(--chakra-colors-brand-grid) 1px, var(--chakra-colors-brand-bg) 1px)`,
      backgroundSize: '20px 20px',
    },
  },
};

// Create the custom theme
export const theme = extendTheme({ colors, styles });