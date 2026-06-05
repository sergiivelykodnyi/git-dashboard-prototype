/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-tailwindcss',
    'stylelint-config-clean-order'
  ],
  rules: {
    'at-rule-no-deprecated': [true, { ignoreAtRules: ['apply'] }],
    'no-descending-specificity': null,
    'selector-class-pattern': [
      '^[a-z][a-z0-9_-]*$',
      {
        message:
          'Expected selector to use kebab-case or follow to BEM naming convention (e.g., block__element--modifier).'
      }
    ],
    'value-keyword-case': ['lower', { camelCaseSvgKeywords: true }]
  }
};
