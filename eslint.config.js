module.exports = {
    // Definir las extensiones a analizar
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  
    // Resto de la configuración de ESLint
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    env: {
      browser: true,
      node: true,
    },
    rules: {
      // Tus reglas personalizadas de ESLint
    },
  };
  