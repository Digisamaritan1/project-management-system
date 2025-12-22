export default [
    {
        path: '/signup',
        name: 'Sign_Up',
        component: () => import(/* webpackChunkName: "Register" */ './views/Register.vue'),
        meta: {
            title: 'Register',
            requiresAuth: false
        }
    }
];
