module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@utils': './src/utils',
            '@react-native-async-storage/async-storage': '@react-native-async-storage/async-storage/lib/commonjs/index.js',
            // Ajoutez d'autres alias si nécessaire
          },
        },
      ],
    ],
  };
};