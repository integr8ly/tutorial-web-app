const path = require('path');

module.exports = {
  extends: ['plugin:patternfly-react/recommended'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'import/no-named-as-default': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'react/no-unused-prop-types': 'off',
    'camelcase': ['error', { 'allow': ['access_token', 'auth_token'] }]
  }
};
