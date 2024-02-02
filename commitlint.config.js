module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [2, 'always', [
        'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'
      ]],
      'scope-enum': [2, 'always', [
        '', // commits without a scope
        'BE', 'FE', 'API' // specific microservice scopes
      ]]
    }
  };
  