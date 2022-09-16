module.exports = {
  extends: ['next', 'turbo'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
      },
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'operator-linebreak': [
      'error',
      'before',
    ],
    'one-var': [
      'error',
      {
        'var': 'never',
        'let': 'never',
        'const': 'never',
      },
    ],
    'no-unreachable': 'error',
    semi: [
      'error',
      'always',
    ],
    'comma-dangle': ['error', 'always-multiline'],
    'quote-props': ['error', 'as-needed'],
    'no-use-before-define': ['error', 'nofunc'],
    'block-spacing': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
  },
};
