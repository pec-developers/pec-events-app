import express from 'express';
import request from 'supertest';

function buildApp(withUser: boolean = false) {
  jest.resetModules();

  // Mock supabase
  jest.doMock('../supabase', () => ({ supabase: {} }));

  // Mock PublisherService and capture instance
  let serviceInstance: any;
  jest.doMock('../services/publisher.service', () => {
    class PublisherServiceMock {
      getEvents = jest.fn();
      getEventById = jest.fn();
      updateEvent = jest.fn();
      createEvent = jest.fn();
      deleteEvent = jest.fn();
      getProfile = jest.fn();
    }
    serviceInstance = new PublisherServiceMock();
    const PublisherService = jest.fn().mockImplementation(() => serviceInstance);
    return { PublisherService };
  });

  const app = express();
  app.use(express.json());

  if (withUser) {
    // Inject a fake authenticated user before the router
    app.use((req, _res, next) => {
      (req as any).user = { userId: 'user-123', username: 'alice', role: 'publisher' };
      next();
    });
  }

  jest.isolateModules(() => {
    const publisherRouter = require('../routes/publisher').default;
    app.use('/', publisherRouter);
  });

  return { app, getService: () => serviceInstance };
}

const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('Publisher routes', () => {
  describe('GET /events', () => {
    test('200 with events on success', async () => {
      const { app, getService } = buildApp();
      getService().getEvents.mockResolvedValue({ success: true, events: [] });
      const res = await request(app).get('/events').query({ dept: 'CSE', type: 'Workshop', name: 'AI' });
      expect(getService().getEvents).toHaveBeenCalledWith('CSE', 'Workshop', 'AI');
      expect(res.status).toBe(200);
    });
    test('500 when service fails', async () => {
      const { app, getService } = buildApp();
      getService().getEvents.mockResolvedValue({ success: false, message: 'err' });
      const res = await request(app).get('/events');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /events/:eventId', () => {
    test('400 when invalid UUID', async () => {
      const { app } = buildApp();
      const res = await request(app).get('/events/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: 'INVALID_INPUT' });
    });
    test('404 when service not success', async () => {
      const { app, getService } = buildApp();
      getService().getEventById.mockResolvedValue({ success: false, message: 'not found' });
      const res = await request(app).get(`/events/${validUuid}`);
      expect(res.status).toBe(404);
    });
    test('200 when success', async () => {
      const { app, getService } = buildApp();
      getService().getEventById.mockResolvedValue({ success: true, event: { id: validUuid } });
      const res = await request(app).get(`/events/${validUuid}`);
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /events/:eventId', () => {
    test('400 when invalid UUID', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .put('/events/not-a-uuid')
        .type('form')
        .field('data', JSON.stringify({ title: 'T' }));
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: 'INVALID_INPUT' });
    });
    test('400 when neither data nor image provided', async () => {
      const { app } = buildApp();
      const res = await request(app).put(`/events/${validUuid}`);
      expect(res.status).toBe(400);
    });
    test("400 when 'data' is invalid JSON", async () => {
      const { app } = buildApp();
      const res = await request(app)
        .put(`/events/${validUuid}`)
        .type('form')
        .field('data', '{invalid json');
      expect(res.status).toBe(400);
    });
    test('200 when update succeeds (data only)', async () => {
      const { app, getService } = buildApp();
      getService().updateEvent.mockResolvedValue({ success: true, eventId: validUuid, message: 'ok' });
      const payload = { title: 'T' };
      const res = await request(app)
        .put(`/events/${validUuid}`)
        .type('form')
        .field('data', JSON.stringify(payload));
      expect(getService().updateEvent).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
    test('500 when update fails', async () => {
      const { app, getService } = buildApp();
      getService().updateEvent.mockResolvedValue({ success: false, message: 'fail' });
      const res = await request(app)
        .put(`/events/${validUuid}`)
        .type('form')
        .field('data', JSON.stringify({ title: 'T' }));
      expect(res.status).toBe(500);
    });
  });

  describe('POST /events', () => {
    test('400 when S3 upload error bubbles from service', async () => {
      const { app, getService } = buildApp(true);
      // Mimic a service failure specific to S3
      getService().createEvent.mockResolvedValue({ success: false, code: 'S3_UPLOAD_ERROR', message: 'S3 error' });
      const res = await request(app)
        .post('/events')
        .type('form')
        .field('data', JSON.stringify({
          title: 'T', description: 'D', eventType: 'Seminar', date: '2025-10-01', startTime: '10:00:00', endTime: '11:00:00', venue: 'Hall', mode: 'Offline', eligibility: 'All', fee: '0', registrationLink: 'http://example.com', organizers: [{ name: 'A' }], contacts: [{ phone: '123' }]
        }));
      expect(res.status).toBe(500);
      expect(res.body).toMatchObject({ success: false });
    });
    const baseData = {
      title: 'T',
      description: 'D',
      eventType: 'Seminar',
      date: '2025-10-01',
      startTime: '10:00:00',
      endTime: '11:00:00',
      venue: 'Hall',
      mode: 'Offline',
      eligibility: 'All',
      fee: '0',
      registrationLink: 'http://example.com',
      organizers: [{ name: 'A' }],
      contacts: [{ phone: '123' }],
    };

    test("400 when missing 'data'", async () => {
      const { app } = buildApp(true);
      const res = await request(app).post('/events');
      expect(res.status).toBe(400);
    });

    test('400 when invalid JSON in data', async () => {
      const { app } = buildApp(true);
      const res = await request(app).post('/events').field('data', '{bad');
      expect(res.status).toBe(400);
    });

    test('400 when required fields missing', async () => {
      const { app } = buildApp(true);
      const res = await request(app)
        .post('/events')
        .type('form')
        .field('data', JSON.stringify({ title: 'only title' }));
      expect(res.status).toBe(400);
    });

    test('201 when create succeeds', async () => {
      const { app, getService } = buildApp(true);
      getService().createEvent.mockResolvedValue({ success: true, eventId: validUuid, message: 'created' });
      const res = await request(app)
        .post('/events')
        .type('form')
        .field('data', JSON.stringify(baseData));
      expect(getService().createEvent).toHaveBeenCalled();
      expect(res.status).toBe(201);
    });

    test('500 when service fails', async () => {
      const { app, getService } = buildApp(true);
      getService().createEvent.mockResolvedValue({ success: false, message: 'db error' });
      const res = await request(app)
        .post('/events')
        .type('form')
        .field('data', JSON.stringify(baseData));
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /events/:eventId', () => {
    test('400 when invalid UUID', async () => {
      const { app } = buildApp();
      const res = await request(app).delete('/events/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ success: false, code: 'INVALID_INPUT' });
    });
    test('200 when delete succeeds', async () => {
      const { app, getService } = buildApp();
      getService().deleteEvent.mockResolvedValue({ success: true, message: 'deleted' });
      const res = await request(app).delete(`/events/${validUuid}`);
      expect(res.status).toBe(200);
    });
    test('500 when delete fails', async () => {
      const { app, getService } = buildApp();
      getService().deleteEvent.mockResolvedValue({ success: false, message: 'err' });
      const res = await request(app).delete(`/events/${validUuid}`);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /profile', () => {
    test('401 when user not set', async () => {
      const { app } = buildApp(false);
      const res = await request(app).get('/profile');
      expect(res.status).toBe(401);
    });
    test('200 when success', async () => {
      const { app, getService } = buildApp(true);
      getService().getProfile.mockResolvedValue({ success: true, user: { fullname: 'X', role: 'Publisher', department: 'Department of CSE' }, pastEvents: [], upcomingEvents: [] });
      const res = await request(app).get('/profile');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
    test('500 when service fails', async () => {
      const { app, getService } = buildApp(true);
      getService().getProfile.mockResolvedValue({ success: false, message: 'err' });
      const res = await request(app).get('/profile');
      expect(res.status).toBe(500);
    });
  });
});
