import axios, { AxiosStatic } from 'axios';

// Use require for lodash to avoid TypeScript module resolution issues
const _ = require('lodash');

// Extend Window interface to include our global objects
declare global {
    interface Window {
        _: any; // Use any for lodash to avoid complex type issues
        axios: AxiosStatic;
    }
}

// Make lodash available globally
window._ = _;

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// Uncomment and configure when you need real-time features
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// declare global {
//     interface Window {
//         Pusher: typeof Pusher;
//         Echo: Echo;
//     }
// }

// window.Pusher = Pusher;

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });

export {};
