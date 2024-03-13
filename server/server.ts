import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Chat } from './agent';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors,{
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
});

fastify.post('/api/chat', async (request, reply) => {
  return Chat(request.body);
});

// Start server
fastify.listen({ port: 6677 }, (err, address) => {
  // console.log(`Server listening at ${address}`);
  if (err) {
    throw err
  }
});