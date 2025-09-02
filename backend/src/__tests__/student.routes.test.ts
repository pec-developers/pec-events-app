import express from 'express';
import request from 'supertest';

// Helper to build an express app mounting the student router with mocked dependencies per test
function buildApp() {
  jest.resetModules();

  // Mock supabase module to avoid env checks
  jest.doMock('../supabase', () => ({ supabase: {} }));

  // Capture the instance of StudentService created by the router
  let serviceInstance: any;
  jest.doMock('../services/student.service', () => {
    const StudentService = jest.fn().mockImplementation(() => {
      serviceInstance = { getEventById: jest.fn() };
      return serviceInstance;
    });
    return { StudentService };
  });

  const app = express();

  // Load the student router in isolation so our mocks apply
  jest.isolateModules(() => {
    const studentRouter = require('../routes/student').default;
    app.use('/', studentRouter);
  });

  return { app, getService: () => serviceInstance };
}

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('Student routes - GET /events/:eventId', () => {
  test('returns 400 for invalid UUID', async () => {
    const { app } = buildApp();

    const res = await request(app).get('/events/not-a-uuid');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, code: 'INVALID_INPUT' });
  });

  test('returns 404 when service returns NOT_FOUND', async () => {
    const { app, getService } = buildApp();
    getService().getEventById.mockResolvedValue({ success: false, code: 'NOT_FOUND', message: 'Event not found.' });

    const res = await request(app).get(`/events/${validUuid}`);
    expect(getService().getEventById).toHaveBeenCalledWith(validUuid);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: 'NOT_FOUND' });
  });

  test('returns 500 when service returns other failure', async () => {
    const { app, getService } = buildApp();
    getService().getEventById.mockResolvedValue({ success: false, code: 'DB_ERROR', message: 'Failed to get event.' });

    const res = await request(app).get(`/events/${validUuid}`);
    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ success: false });
  });

  test('returns 200 with event on success', async () => {
    const { app, getService } = buildApp();
    const payload = { success: true, event: { id: validUuid, title: 'Test' } };
    getService().getEventById.mockResolvedValue(payload);

    const res = await request(app).get(`/events/${validUuid}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(payload);
  });
});
