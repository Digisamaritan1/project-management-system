import { createRouter, createWebHashHistory } from 'vue-router'
import { useCustomComposable } from '@/composable'
const routes = [
	{
        path: '/',
        name: 'Install_Step',
        component: () => import(/* webpackChunkName: "Install_Step" */ '@/views/InstallStep/InstallStep.vue'),
		meta: {
            title: "Install Step",
            requiresAuth: false,
        },
    },
	{
		path: "/:catchAll(.*)",
		name: "404",
		component: () => import(/* webpackChunkName: "404" */ '@/views/NotFound'),
		meta: {
			title: '404'
		}
	}
]

const router = createRouter({
	history: createWebHashHistory(process.env.BASE_URL),
	routes
})

const {setTitle} = useCustomComposable()
router.beforeEach((to, _, next) => {
	setTitle({title: to.meta.title, prefix: "Alian Hub | "});
	next();
})

export default router;
