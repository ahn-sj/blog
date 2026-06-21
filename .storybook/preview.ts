import type { Preview } from '@storybook/nextjs';

import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
