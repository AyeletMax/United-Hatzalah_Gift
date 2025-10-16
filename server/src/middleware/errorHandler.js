const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err);

  // Database connection errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    return res.status(503).json({ 
      error: 'Database connection lost. Please try again.',
      code: 'DB_CONNECTION_ERROR'
    });
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable. Please try again.',
      code: 'SERVICE_UNAVAILABLE'
    });
  }

  // Validation errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Duplicate entry. This record already exists.',
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

export default errorHandler;