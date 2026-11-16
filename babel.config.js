module.exports = function (api) {
  const isBackend = api.env('backend');
  const isFrontend = api.env('frontend');

  if (isBackend) {
    return {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs' }]
      ]
    };
  }

  if (isFrontend) {
    return {
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/preset-react'
      ]
    };
  }

  return {
    overrides: [
      {
        test: /(^|[\\/])backend([\\/]|$)/,
        presets: [
          ['@babel/preset-env', { modules: 'commonjs' }]
        ]
      },
      {
        test: /(^|[\\/])frontend([\\/]|$)/,
        presets: [
          ['@babel/preset-env', { modules: false }],
          '@babel/preset-react'
        ]
      }
    ],
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-react'
    ]
  };
};
