import { test, expect } from '@playwright/test';
import { UserApiService } from '../../src/api/user.api';

test.describe('API Smoke Suite - User Management', () => {
  let userApi: UserApiService;

  test.beforeEach(async ({ request }) => {
    userApi = new UserApiService(request);
  });

  test('GET /users - should return list of users with 200 OK', async () => {
    const response = await userApi.getUsers(1);

    // 1. Status Code Validation
    expect(response.status()).toBe(200);

    // 2. Response Headers
    expect(response.headers()['content-type']).toContain('application/json');

    // 3. Schema / Body Structure Validation
    const body = await response.json();
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBeTruthy();
    expect(body.data.length).toBeGreaterThan(0);

    // 4. Data sanity check on first item
    const firstUser = body.data[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('email');
    expect(firstUser).toHaveProperty('first_name');
  });

  test('POST /users - should create a user and return 201 Created', async () => {
    const payload = {
      name: 'John Doe',
      job: 'QA Automation Engineer',
    };

    const response = await userApi.createUser(payload);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });

  test('GET /users/2 - should return specific user profile', async () => {
    const response = await userApi.getUserById(2);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data.email).toBeTruthy();
  });

  test('DELETE /users/2 - should delete user and return 204 No Content', async () => {
    const response = await userApi.deleteUser(2);
    expect(response.status()).toBe(204);
  });
});
