const request = require('supertest');
require('dotenv').config();

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

describe('User Register API Tests', () => {

  it('should register a new user successfully', async () => {
    const uniqueName = `testuser_${Date.now()}`;
    const uniqueEmail = `register_${Date.now()}@gmail.com`;

    const res = await request(BASE_URL)
      .post('/api/user/register')
      .send({
        name: uniqueName,
        email: uniqueEmail,
        password: 'securepassword123'
      });

    console.log(res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toEqual('User Registered Sucessfully!!');
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/register')
      .send({
        email: 'missingfields@gmail.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toEqual('All Fields are required!!');
  });

  it('should return 409 if email already exists', async () => {
    const email = `duplicate_${Date.now()}@gmail.com`;

    // create user first
    await request(BASE_URL)
      .post('/api/user/register')
      .send({
        name: 'Duplicate User',
        email: email,
        password: 'password123'
      });

    // try again with same email
    const res = await request(BASE_URL)
      .post('/api/user/register')
      .send({
        name: 'Duplicate User',
        email: email,
        password: 'password123'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toEqual('User already Exist with this Email');
  });

  it('should return 500 if server error occurs', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/register')
      .send({
        name: 'Error User',
        email: null,
        password: 'password123'
      });

    expect([400, 500]).toContain(res.statusCode);
  });

});

describe('Login API Tests', () => {

  it('should login user successfully when credentials are correct', async () => {
    // Ensure this user exists and is active in the database
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: 'verified_user@example.com', // must exist & verified
        password: 'securepassword123'
      });

    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toEqual('User Login Sucessfully');
    expect(res.body).toHaveProperty('token');
  });

  it('should return 400 if email is missing', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        password: 'securepassword123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('All Fields are Required');
  });

  it('should return 400 if password is missing', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: 'verified_user@example.com'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('All Fields are Required');
  });

  it('should return 400 if email does not exist', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: `nonexistent_${Date.now()}@example.com`,
        password: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('Password and Email Doesnot Match!!');
  });

  it('should return 400 if password is incorrect', async () => {
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: 'verified_user@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('Password and Email Doesnot Match!!');
  });

  it('should return 400 if email is not verified', async () => {
    // Ensure this user is set as isEmailVerified: false in your DB
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: 'unverified_user@example.com', // exists but isEmailVerified=false
        password: 'securepassword123'
      });

    console.log(res.body);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message)
      .toEqual('Your Mail isnot Verified!! Go back to your Mail and Try Verifying!!');
  });

  it('should return 400 if user is inactive', async () => {
    // Ensure this user is set as isActive: false in your DB
    const res = await request(BASE_URL)
      .post('/api/user/login')
      .send({
        email: 'inactive_user@example.com', // isActive=false
        password: 'securepassword123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toEqual('No User Found');
  });


});
