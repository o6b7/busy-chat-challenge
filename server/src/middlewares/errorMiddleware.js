

export function notFound(req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';

  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(isDev && { stack: err.stack })
    }
  });
}
