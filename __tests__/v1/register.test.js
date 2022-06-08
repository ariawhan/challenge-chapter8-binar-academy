const request = require('supertest');
const app = require('../../app');

describe('POST /v1/auth/register', () => {

    it('should response with 201 as status code (Success Register)', async () => {
        const name = 'ariawan';
        const email = 'ariawhan2@gmail.com';
        const password = 'safiratyas';

        return await request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({ name, email, password })
        .then((res) => {
            expect(res.statusCode).toBe(201);
        });
    });
    it('should response with 422 as status code (Email Already Taken)', async () => {
        const name = 'Fikri';
        const email = 'Fikri@@binar.co.id';
        const password = '123456';

        return await request(app)
        .post('/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({ name, email, password })
        .then((res) => {
            // console.log(res.body.error.details.email)
            expect(res.statusCode).toBe(422);
            expect(res.body.error.details.email.toLowerCase()).toEqual(email.toLowerCase());
        });
    });
});