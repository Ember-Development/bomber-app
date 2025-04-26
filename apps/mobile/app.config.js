import 'dotenv/config';

export default {
  expo: {
    name: 'bomber-app',
    slug: 'bomber-app',
    extra: {
      API_BASE_URL: process.env.API_BASE_URL,
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL,
    },
  },
};
