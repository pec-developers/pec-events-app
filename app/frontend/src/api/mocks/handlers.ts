import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    const { email } = (await request.json()) as any;
    if (email === 'invalid@pec.edu') {
      return new HttpResponse(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return HttpResponse.json({
      userId: '11111111-1111-1111-1111-111111111111',
      name: 'John Doe',
      email: email,
      role: 'STUDENT',
      department: 'CSE',
      registrationNumber: 'PEC-100234',
      accessToken: 'mock-access-token'
    });
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    const { email, name, registrationNumber } = (await request.json()) as any;
    return HttpResponse.json({
      userId: '11111111-1111-1111-1111-111111111111',
      name,
      email,
      role: 'STUDENT',
      department: 'CSE',
      registrationNumber,
      accessToken: 'mock-access-token'
    });
  }),

  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('*/api/auth/me', () => {
    return HttpResponse.json({
      userId: '11111111-1111-1111-1111-111111111111',
      name: 'John Doe',
      email: 'test@pec.edu',
      role: 'STUDENT',
      department: 'CSE',
      registrationNumber: 'PEC-100234'
    });
  })
];
