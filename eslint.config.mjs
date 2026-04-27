import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'lib/actions-backup.ts',
      'lib/actions-clean.ts.bak',
    ],
    rules: {
      // Existing UI copy is French-heavy; escaping every apostrophe would create a noisy migration.
      'react/no-unescaped-entities': 'off',
      // React Compiler rules are useful later, but too strict for the current codebase baseline.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
