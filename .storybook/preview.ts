import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import '@/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F3EEE8' },
        { name: 'dark', value: '#0D0D0D' },
        { name: 'snow', value: '#FAFAFA' },
        { name: 'whisper', value: '#E5E5E5' },
      ],
    },
    layout: 'centered',
    chromatic: {
      viewports: [320, 768, 1280],
      delay: 300,
      diffThreshold: 0.2,
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
      <ToastProvider>
      <div className= "p-4 min-h-[200px]" >
      <Story />
      </div>
      </ToastProvider>
      </ThemeProvider>
    ),
  ],
globalTypes: {
  theme: {
    description: 'Global theme for components',
      defaultValue: 'light',
        toolbar: {
      title: 'Theme',
        icon: 'circlehollow',
          items: ['light', 'dark'],
            dynamicTitle: true,
      },
  },
},
};

export default preview;