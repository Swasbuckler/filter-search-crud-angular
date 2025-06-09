import { EnvironmentPlugin } from 'webpack';

import dotenv from 'dotenv';
dotenv.config();

module.exports = {
  output: {
    crossOriginLoading: 'anonymous'
  },
  plugins: [
    new EnvironmentPlugin([
      'BACKEND_URL'
    ])
  ],
};