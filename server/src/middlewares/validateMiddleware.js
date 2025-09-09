export function validateChatInput(req, res, next) {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required and must be a non-empty string' });
  }
  next();
}

export function validateEmailInput(req, res, next) {
  const { to, subject, body } = req.body;
  if (!to || typeof to !== 'string') {
    return res.status(400).json({ error: 'to is required (recipient email)' });
  }
  if (!subject || typeof subject !== 'string') {
    return res.status(400).json({ error: 'subject is required' });
  }
  if (!body || typeof body !== 'string') {
    return res.status(400).json({ error: 'body is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) return res.status(400).json({ error: 'to must be a valid email address' });
  next();
}
