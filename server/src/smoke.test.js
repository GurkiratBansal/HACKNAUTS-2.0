import { beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'

let app

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.PORT = process.env.PORT || '4000'
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/fresh_test'
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'test-secret-key-test-secret-key-123456'
  process.env.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

  ;({ app } = await import('./app.js'))
})

describe('server smoke', () => {
  it('GET /health returns ok', async () => {
    const response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true, service: 'fresh-server' })
  })

  it('hashes and verifies login passwords with bcryptjs cost 12', async () => {
    const password = 'correct horse battery staple'
    const hash = await bcrypt.hash(password, 12)
    expect(hash).not.toBe(password)
    expect(await bcrypt.compare(password, hash)).toBe(true)
    expect(await bcrypt.compare('wrong-password', hash)).toBe(false)
  })
})
