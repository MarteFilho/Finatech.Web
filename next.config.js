const withTM = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/daygrid',
  '@fullcalendar/interaction',
  '@fullcalendar/list',
  '@fullcalendar/react',
  '@fullcalendar/timegrid',
  '@fullcalendar/timeline',
]);

module.exports = withTM({
  swcMinify: false,
  trailingSlash: true,
  env: {
    // HOST
    HOST_API_KEY: 'https://api-dev-minimal-v4.vercel.app',
    // MAPBOX
    MAPBOX_API: '',
    // FIREBASE
    FIREBASE_API_KEY: 'firebaseConfig',
    FIREBASE_AUTH_DOMAIN: 'finatech-e379e.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'finatech-e379e',
    FIREBASE_STORAGE_BUCKET: 'finatech-e379e.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '898356766063',
    FIREBASE_APPID: '1:898356766063:web:63b745e6e9518fe811749a',
    FIREBASE_MEASUREMENT_ID: 'G-KZ806BFYCW',
    // AWS COGNITO
    AWS_COGNITO_USER_POOL_ID: '',
    AWS_COGNITO_CLIENT_ID: '',
    // AUTH0
    AUTH0_DOMAIN: '',
    AUTH0_CLIENT_ID: '',
  },
});
