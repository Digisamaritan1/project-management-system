export default [
    {
        path: '/:cid/report/time-forcasting',
        name: 'Time Forecasting',
        meta: {
            title: "Time Forecasting",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "TimeForcasting" */ '@/views/Reports/TimeForcasting/TimeForcasting.vue'),
    },
]