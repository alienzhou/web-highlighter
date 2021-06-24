module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'prettier',
    'import',
  ],
  extends: [
    "eslint:all",
    'plugin:@typescript-eslint/all',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  rules: {
    "array-bracket-newline": [
      "error",
      "consistent"
    ],
    "array-element-newline": [
      "error",
      "consistent"
    ],
    "arrow-parens": [
      "error",
      "as-needed"
    ],
    "class-methods-use-this": "off",
    "capitalized-comments": "off",
    "comma-dangle": [
      "error",
      "always-multiline"
    ],
    "dot-location": [
      "error",
      "property"
    ],
    "func-names": [
      "error",
      "as-needed"
    ],
    "id-length": "off",
    "implicit-arrow-linebreak": "off",
    "init-declarations": "off",
    "max-len": [
      "error",
      120
    ],
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-params": "off",
    "max-statements": "off",
    "multiline-comment-style": "off",
    "multiline-ternary": [
      "error",
      "always-multiline"
    ],
    "newline-per-chained-call": [
      "error",
      {
        "ignoreChainWithDepth": 2
      }
    ],
    "no-await-in-loop": "off",
    "no-bitwise": "off",
    "no-confusing-arrow": "off",
    "no-constant-condition": [
      "error",
      {
        "checkLoops": false
      }
    ],
    "no-continue": "off",
    "no-duplicate-imports": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "import/no-duplicates": [
      "error",
      {
        "considerQueryString": true
      }
    ],
    "no-empty": "off",
    "no-implicit-coercion": "off",
    "no-invalid-this": "off",
    "no-mixed-operators": "off",
    "no-multiple-empty-lines": [
      "error",
      {
        "max": 2,
        "maxEOF": 1
      }
    ],
    "no-plusplus": [
      "error",
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    "no-process-env": "off",
    "no-shadow": "off",
    "no-ternary": "off",
    "no-unused-expressions": "off",
    "no-warning-comments": "off",
    "new-cap": "off",
    "one-var": [
      "error",
      "never"
    ],
    "padded-blocks": [
      "error",
      "never"
    ],
    "padding-line-between-statements": [
      "error",
      {
        "blankLine": "always",
        "prev": [
          "const",
          "let",
          "var"
        ],
        "next": "*"
      },
      {
        "blankLine": "always",
        "prev": "*",
        "next": [
          "const",
          "let",
          "var"
        ]
      },
      {
        "blankLine": "any",
        "prev": [
          "const",
          "let",
          "var"
        ],
        "next": [
          "const",
          "let",
          "var"
        ]
      },
      {
        "blankLine": "always",
        "prev": "*",
        "next": "return"
      },
      {
        "blankLine": "always",
        "prev": "block-like",
        "next": "*"
      },
      {
        "blankLine": "always",
        "prev": "*",
        "next": "block-like"
      }
    ],
    "prefer-destructuring": "off",
    "quote-props": [
      "error",
      "as-needed"
    ],
    "quotes": [
      "error",
      "single",
      {
        "avoidEscape": true
      }
    ],
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "require-atomic-updates": "off",
    "require-unicode-regexp": "off",
    "semi": "off",
    "sort-imports": "off",
    "sort-keys": "off",
    "wrap-regex": "off",
    "import/default": "off",

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        "accessibility": "no-public"
      }
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/generic-type-naming": "off",
    "@typescript-eslint/init-declarations": "off",
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/no-dynamic-delete": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-extraneous-class": [
      "error",
      {
        "allowWithDecorator": true
      }
    ],
    "@typescript-eslint/no-invalid-this": "off",
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-magic-numbers": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-throw-literal": "off",
    "@typescript-eslint/no-type-alias": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_$",
        "varsIgnorePattern": "^_$",
        "ignoreRestSiblings": true
      }
    ],
    "@typescript-eslint/prefer-includes": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "@typescript-eslint/prefer-string-starts-ends-with": "off",
    "@typescript-eslint/promise-function-async": "off",
    "@typescript-eslint/restrict-template-expressions": [
      "warn",
      {
        "allowNumber": true
      }
    ],
    "@typescript-eslint/semi": "error",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/typedef": "off",
    "prettier/prettier": "error"
  },
};
