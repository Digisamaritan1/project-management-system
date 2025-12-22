export default [
    {
        path: '/installstep',
        name: 'Install_Step',
        component: () => import(/* webpackChunkName: "Install_Step" */ '@/views/InstallStep/InstallStep.vue'),
		meta: {
            title: "Install Step",
            requiresAuth: false,
        },
    }
]