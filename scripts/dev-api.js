import http from 'node:http'
import handler from '../api/explain.js'

const PORT = 8787
const MAX_BODY = 10_000 // bytes; the real request is under 300

const server = http.createServer(async (req, res) => {
  if (req.url !== '/api/explain') {
    res.statusCode = 404
    return res.end()
  }

  // Read the body, with a size cap
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) {
      res.statusCode = 413
      return res.end()
    }
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString()
  try {
    req.body = raw ? JSON.parse(raw) : undefined
  } catch {
    req.body = undefined
  }

  // Tiny shim so the handler can use res.status(...).json(...)
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  }

  try {
    await handler(req, res)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Bind to localhost only, so nobody on your network can use your key
server.listen(PORT, '127.0.0.1', () => {
  console.log(`API dev server on http://127.0.0.1:${PORT}`)
})