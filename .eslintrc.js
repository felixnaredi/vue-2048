module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'standard'
  ],
  parserOptions: {
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'max-len': ['error', {
      code: 100
    }]
  }
}
