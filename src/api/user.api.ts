import { APIRequestContext, APIResponse } from '@playwright/test';

export interface CreateUserPayload {
  name: string;
  job: string;
}

export interface UserResponse {
  id?: string;
  name?: string;
  job?: string;
  createdAt?: string;
}

export class UserApiService {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  /**
   * Fetches user list with pagination
   */
  async getUsers(page: number = 1): Promise<APIResponse> {
    return await this.request.get(`users?page=${page}`);
  }

  /**
   * Fetches a single user by ID
   */
  async getUserById(id: number): Promise<APIResponse> {
    return await this.request.get(`users/${id}`);
  }

  /**
   * Creates a new user
   */
  async createUser(payload: CreateUserPayload): Promise<APIResponse> {
    return await this.request.post('users', {
      data: payload,
    });
  }

  /**
   * Deletes a user by ID
   */
  async deleteUser(id: number): Promise<APIResponse> {
    return await this.request.delete(`users/${id}`);
  }
}
