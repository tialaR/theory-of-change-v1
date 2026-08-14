import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.patch-backups/**',
      '.shark/runtime-backups/**',
      '.tdm-patches/**'
    ]
  }
];

export default config;
