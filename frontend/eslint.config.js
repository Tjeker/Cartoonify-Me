import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist/**']),
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['src/**/*.{js,vue}'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['*.config.js'],
    languageOptions: { globals: globals.node }
  },
  prettier
])
