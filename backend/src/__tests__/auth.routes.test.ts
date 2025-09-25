import express from 'express';
import request from 'supertest';

// Ensure env to prevent any real constructor exits if used
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function buildApp() {
  jest.resetModules();

  // Mock supabase to avoid env checks in supabase.ts
  jest.doMock('../supabase', () => ({ supabase: {} }));

  let serviceInstance: any;
  jest.doMock('../services/auth.service', () => {
    class AuthServiceMock {
      login = jest.fn();
      register = jest.fn();
    }
    serviceInstance = new AuthServiceMock();
    const AuthService = jest.fn().mockImplementation(() => serviceInstance);
    return { AuthService };
  });

  const app = express();
  app.use(express.json());

  jest.isolateModules(() => {
    const authRouter = require('../routes/auth').default;
    app.use('/', authRouter);
  });

  return { app, getService: () => serviceInstance };
}

describe('Auth routes', () => {
  describe('POST /login', () => {
    test('400 when missing username or password', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/login').send({ username: 'u' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false });
    });

    test('200 with token and userRole on success', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: true, token: 't', userRole: 'publisher' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(getService().login).toHaveBeenCalledWith('u', 'p');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, token: 't', userRole: 'publisher' });
    });

    test('404 on USER_NOT_FOUND', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'USER_NOT_FOUND', message: 'User account does not exist.' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ success: false });
    });

    test('401 on WRONG_PASSWORD', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'WRONG_PASSWORD', message: 'Incorrect password.' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(401);
    });

    test('500 on PASSWORD_HASH_INVALID', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'PASSWORD_HASH_INVALID' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(500);
    });

    test('500 on PASSWORD_VERIFY_ERROR', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'PASSWORD_VERIFY_ERROR' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(500);
    });

    test('500 on TOKEN_SIGN_ERROR', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'TOKEN_SIGN_ERROR' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(500);
    });

    test('500 on UNEXPECTED_ERROR', async () => {
      const { app, getService } = buildApp();
      getService().login.mockResolvedValue({ success: false, code: 'UNEXPECTED_ERROR' });
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(500);
    });

    test('500 on thrown error', async () => {
      const { app, getService } = buildApp();
      getService().login.mockRejectedValue(new Error('boom'));
      const res = await request(app).post('/login').send({ username: 'u', password: 'p' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /register', () => {
    test('400 when missing required fields', async () => {
      const { app } = buildApp();
      const res = await request(app).post('/register').send({ username: 'u' });
      expect(res.status).toBe(400);
    });

    test('201 on successful registration', async () => {
      const { app, getService } = buildApp();
      const user = { id: '1', username: 'u', user_role: 'publisher', department: 'CSE', fullname: 'Name', mailid: 'e@x.com' };
      getService().register.mockResolvedValue({ success: true, user });
      const res = await request(app).post('/register').send({ username: 'u', password: 'p', user_role: 'publisher', department: 'CSE', fullname: 'Name', mailid: 'e@x.com' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ success: true, user });
    });

    test('400 when service fails', async () => {
      const { app, getService } = buildApp();
      getService().register.mockResolvedValue({ success: false, message: 'User registration failed.' });
      const res = await request(app).post('/register').send({ username: 'u', password: 'p', user_role: 'publisher', department: 'CSE', fullname: 'Name', mailid: 'e@x.com' });
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false });
    });
  });
});
