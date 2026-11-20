const path = require('path');
const express = require('express');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use('/vendor/html2canvas', express.static(path.join(__dirname, 'node_modules', 'html2canvas', 'dist')));
app.use(express.static(frontendPath));
app.use('/api/profile', profileRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'The requested API endpoint was not found.'
    });
  }

  return next();
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Profile generator is running at http://localhost:${PORT}`);
});
