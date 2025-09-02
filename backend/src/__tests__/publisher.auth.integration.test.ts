import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Use a real JWT with the auth middleware
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function buildAppWithAuth(role: string = 'publisher') {
  jest.resetModules();

  // Prevent real Supabase usage
  jest.doMock('../supabase', () => ({ supabase: {} }));

  // Mock PublisherService and capture instance
  let serviceInstance: any;
  jest.doMock('../services/publisher.service', () => {
    class PublisherServiceMock {
      getEvents = jest.fn();
      getProfile = jest.fn();
    }
    serviceInstance = new PublisherServiceMock();
    const PublisherService = jest.fn().mockImplementation(() => serviceInstance);
    return { PublisherService };
  });

  const app = express();
  app.use(express.json());

  jest.isolateModules(() => {
    const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
    const publisherRouter = require('../routes/publisher').default;
    app.use('/', authenticateToken, authorizeRoles(['publisher']), publisherRouter);
  });

  // Create JWT for the given role
  const token = jwt.sign(
    { userId: 'pub-1', username: 'sample-publisher', role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  return { app, token, getService: () => serviceInstance };
}

describe('Publisher routes + Auth middleware integration', () => {
  test('401 when Authorization header missing (handled by middleware)', async () => {
    const { app } = buildAppWithAuth('publisher');
    const res = await request(app).get('/events');
    // From authenticateToken in auth.middleware.ts
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ message: 'Authentication token required.' });
  });

  test('403 when role is not authorized', async () => {
    const { app, token } = buildAppWithAuth('student');
    const res = await request(app).get('/events').set('Authorization', `Bearer ${token}`);
    // From authorizeRoles(['publisher'])
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ message: 'Access denied. Insufficient permissions.' });
  });

  test('200 when authorized and service succeeds', async () => {
    const { app, token, getService } = buildAppWithAuth('publisher');
    getService().getEvents.mockResolvedValue({ success: true, events: [] });

    const res = await request(app)
      .get('/events')
      .set('Authorization', `Bearer ${token}`)
      .query({ dept: 'CSE', type: 'Workshop', name: 'AI' });

    expect(getService().getEvents).toHaveBeenCalledWith('CSE', 'Workshop', 'AI');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, events: [] });
  });
});
