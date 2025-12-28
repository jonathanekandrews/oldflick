import express from 'express';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'healthy' });
});

try {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received');
    server.close(() => process.exit(0));
  });
} catch (error) {
  console.error('Failed to start server:', error.message);
  process.exit(1);
}
