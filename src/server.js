import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NotFlex API запущен: http://localhost:${PORT}`);
});