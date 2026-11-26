// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import importX from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
    {
        ignores: ['dist/**', 'coverage/**', 'example/**', 'node_modules/**'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    // Prettier owns formatting; this also turns off every core rule that would conflict with it.
    prettierRecommended,
    {
        files: ['src/**/*.ts', 'test/**/*.ts'],
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
        plugins: {
            '@stylistic': stylistic,
            'import-x': importX,
        },
        rules: {
            // Code-quality rules
            'func-names': ['error', 'as-needed'],
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-empty': 'off',
            'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
            'one-var': ['error', 'never'],
            'import-x/no-duplicates': ['error', { considerQueryString: true }],

            // Layout rules Prettier does not cover
            '@stylistic/padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
                { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: 'block-like', next: '*' },
                { blankLine: 'always', prev: '*', next: 'block-like' },
            ],

            // TypeScript
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_$', varsIgnorePattern: '^_$', ignoreRestSiblings: true },
            ],
        },
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/restrict-template-expressions': ['warn', { allowNumber: true }],
        },
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            'func-names': 'off',
        },
    },
);
