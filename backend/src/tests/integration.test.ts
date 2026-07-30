import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app';

let mongoServer: MongoMemoryServer;
let token: string = '';
let workspaceId: string = '';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    // Teardown
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Health Check', () => {
    it('should return 200 on /api/health', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication & Workspace', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });
      
      if (response.status !== 201) {
        console.error('Signup Error:', response.body);
      }
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // Depending on signup implementation, it might be nested or direct
      expect(response.body.data.email || response.body.data.user?.email).toBe('test@example.com');
    });

    it('should login the user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      token = response.body.data.accessToken;
    });

    it('should create a new workspace for the user', async () => {
      const response = await request(app)
        .post('/api/workspaces')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'My Integration Workspace',
          description: 'A workspace for testing'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('My Integration Workspace');
      
      // Save workspace ID for next tests
      workspaceId = response.body.data.id;
    });

    it('should create a new board in the workspace', async () => {
      const response = await request(app)
        .post(`/api/workspaces/${workspaceId}/boards`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Integration Board',
          workspaceId
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('My Integration Board');
      expect(response.body.data.workspaceId).toBe(workspaceId);
    });
  });
});
