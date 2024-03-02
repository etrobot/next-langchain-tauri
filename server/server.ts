import Fastify from 'fastify';
import cors from '@fastify/cors';
import { searchAgent } from './searchAgent';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors,{
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
});

fastify.post('/api/chat', async (request, reply) => {
  return searchAgent(request);
});

// Start server
fastify.listen({ port: 6677 }, (err, address) => {
  console.log(`Server listening at ${address}`);
  if (err) {
    throw err
  }
});