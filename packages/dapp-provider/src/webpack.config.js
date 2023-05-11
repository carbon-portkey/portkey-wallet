// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const config = {
  entry: './src/inpage.ts',

  output: {
    path: path.resolve(__dirname),
    filename: 'build_output.js',
  },

  mode: 'production',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/u,
        exclude: /node_modules/u,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
};

module.exports = (_env, argv) => {
  if (argv.mode === 'development') {
    config.mode = 'development';
  }
  return config;
};
