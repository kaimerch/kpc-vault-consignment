// Simple JavaScript API endpoint at root level
export default function handler(req, res) {
  res.status(200).json({
    message: 'Test API working',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}