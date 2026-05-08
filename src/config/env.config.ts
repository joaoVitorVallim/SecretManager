export default () => ({
  port: Number(process.env.PORT),

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
  },

  auth: {
    apiToken: process.env.API_TOKEN,
  },
  
});