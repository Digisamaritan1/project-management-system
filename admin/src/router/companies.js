export default [
    {
        path: '/company',
        name: 'Company',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Company/CompanyTab.vue'),
		meta: {
            title: "Company",
            requiresAuth: true,
        },
    },
    {
        path: '/company-detail/:id',
        name: 'Company_Detail',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Company/CompanyDetailTab/CompanyDetailTab.vue'),
		meta: {
            title: "Company",
            requiresAuth: true,
        },
    }
]