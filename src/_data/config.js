module.exports = function () {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiUrlProduction = 'https://gamemaster.pixelastic.com/npcs/api/';
  const apiUrlDevelopment = 'http://localhost:9000/api/';
  const apiUrl = isProduction ? apiUrlProduction : apiUrlDevelopment;
  return { apiUrl };
};
