export default [
    {
        path: '/:cid/report/milestone',
        name: 'Milestone Report',
        meta: {
            title: "Milestone Report",
            requiresAuth: true
        },
        component: () => import(/* webpackChunkName: "MilestoneReport" */ '@/views/MilestoneReport/MilestoneReport.vue'),
    },
]