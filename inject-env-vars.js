const fs = require('fs');

const vercelEnvVars = process.env;
const environmentFilePath = './src/environments/environment.prod.ts';

const environmentContent = `
export const environment = {
  production: true,
  apiUrl: '${vercelEnvVars.API_URL}'
};
`;

fs.writeFileSync(environmentFilePath, environmentContent);

console.log('Variables de entorno inyectadas en environment.prod.ts');
