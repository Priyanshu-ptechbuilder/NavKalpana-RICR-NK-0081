const jwt = require('jsonwebtoken');

const verifyStudentToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No student token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure role is exactly "student" to block teachers
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Access denied - Student role required' });
    }

    req.student = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid student token' });
  }
};

module.exports = verifyStudentToken;
