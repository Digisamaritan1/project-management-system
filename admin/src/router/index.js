import { createRouter, createWebHashHistory } from 'vue-router'
import { useCustomComposable } from '@/composable'
import * as env from '@/config/env';
import setting from './setting';
import companies from './companies';
import auth from './auth';
import { apiRequestWithoutCompnay } from '@/services';
const routes = [
    ...auth,

	{
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Home/Home.vue'),
		meta: {
            title: "Home",
            requiresAuth: true,
        }
    },

	...setting,

    {
        path: '/plan',
        name: 'Plan',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Plan/PlanTab.vue'),
        meta: {
            title: "Plan",
            requiresAuth: true,
        },
    },
    {
        path: '/email-templates',
        name: 'Email Templates',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/EmailTemplates/EmailTemplates.vue'),
        meta: {
            title: "Email Templates",
            requiresAuth: true,
        },
    },
    // {
    //     path: '/coupons',
    //     name: 'Coupons',
    //     component: () => import(/* webpackChunkName: "Admin" */ '@/views/Coupons/CouponsTab.vue'),
    //     meta: {
    //         title: "Coupons",
    //         requiresAuth: true,
    //     },
    // },

    {
        path: '/subscription',
        name: 'Subscription',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Subscriptions/SubscriptionTab.vue'),
        meta: {
            title: "Plan",
            requiresAuth: true,
        },
    },
    {
        path: '/subscription/:id',
        name: 'SubscriptionDetail',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Subscriptions/SubscriptionDetail.vue'),
        meta: {
            title: "Plan",
            requiresAuth: true,
        },
    },

    {
        path: "/:catchAll(.*)",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */ '@/views/NotFound'),
        meta: {
            title: '404'
        }
    },
    ...companies,
    {
        path: '/invoice',
        name: 'Invoice',
        component: () => import(/* webpackChunkName: "Admin" */ '@/views/Invoice/InvoiceTab.vue'),
		meta: {
            title: "Invoice",
            requiresAuth: true,
        },
    },
]

const router = createRouter({
	history: createWebHashHistory(process.env.BASE_URL),
	routes
})
const {setTitle} = useCustomComposable();
router.beforeEach(async(to, _, next) => {
    const localUserId = localStorage.getItem("userId") || '';
	const app = localUserId ?  await apiRequestWithoutCompnay('get',`${env.USER_UPATE}/${localUserId}`) : null;
	let user = app && app?.status === 200 ? app?.data || null : null;
    const requiresAuth = to.meta.requiresAuth;

    // SET PAGE TITLE
    setTitle({title: to.meta.title, prefix: "Super Admin | "});

    if(user === null && (requiresAuth === true || requiresAuth === undefined)) {
        // IF USER IS NOT LOGGED IN AND REQUESTS AUTH REQUIRED PAGE
        next({name: 'Signin', query: {redirect_url: window.location.pathname}});
        return;
    } else if(user !== null && requiresAuth === false) {
        // IF USER IS LOGGED IN AND REQUESTS NO AUTH REQUIRED PAGE
        next({name: "Home"});
        return;
    } else {
        next();
        return;
    }
})
export default router;
