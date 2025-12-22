export default [
    {
        path: '/settings',
        name: 'Settings',
		meta: {
            title: "Settings",
            requiresAuth: true,
        },

        children: [
            {
                path: "/settings/brand",
                name: "Brand Settings",
                component: () => import(/* webpackChunkName: "Brand Settings" */ '@/views/Settings/BrandSettings/BrandSettings.vue'),
                meta: {
                    title: "Brand Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/tracker",
                name: "Tracker Settings",
                component: () => import(/* webpackChunkName: "Brand Settings" */ '@/views/Settings/TrackerSettings/TrackerSettings.vue'),
                meta: {
                    title: "Tracker Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/email",
                name: "Email Settings",
                component: () => import(/* webpackChunkName: "Email Settings" */ '@/views/Settings/EmailSettings/EmailSettings.vue'),
                meta: {
                    title: "Email Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/mongoDb",
                name: "MongoDb Settings",
                component: () => import(/* webpackChunkName: "MongoDb Settings" */ '@/views/Settings/MongoDBSettings/MongoDBSettings.vue'),
                meta: {
                    title: "MongoDb Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/chargebee",
                name: "Chargebee Settings",
                component: () => import(/* webpackChunkName: "Chargebee Settings" */ '@/views/Settings/ChargebeeSettings/ChargebeeSettings.vue'),
                meta: {
                    title: "Chargebee Settings",
                    requiresAuth: true,
                }
            },
            // {
            //     path: "/settings/paddle",
            //     name: "Paddle Settings",
            //     component: () => import(/* webpackChunkName: "Paddle Settings" */ '@/views/Settings/PaddleSettings/PaddleSettings.vue'),
            //     meta: {
            //         title: "Paddle Settings",
            //         requiresAuth: true,
            //     }
            // },
            {
                path: "/settings/wasabi",
                name: "Wasabi Settings",
                component: () => import(/* webpackChunkName: "Wasabi Settings" */ '@/views/Settings/WasabiSettings/WasabiSettings.vue'),
                meta: {
                    title: "Wasabi Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/firebase",
                name: "Firebase Settings",
                component: () => import(/* webpackChunkName: "Firebase Settings" */ '@/views/Settings/FirebaseSettings/FirebaseSettings.vue'),
                meta: {
                    title: "Firebase Settings",
                    requiresAuth: true,
                }
            },
            {
                path: "/settings/ai",
                name: "AI Settings",
                component: () => import(/* webpackChunkName: "Firebase Settings" */ '@/views/Settings/AISettings/AISettings.vue'),
                meta: {
                    title: "AI Settings",
                    requiresAuth: true
                }
            },
            {
                path: "/settings/oauth",
                name: "oAuth_Settings",
                component: () => import(/* webpackChunkName: "oAuth_Settings" */ '@/views/Settings/OAuth/OAuth.vue'),
                meta: {
                    title: "oAuth Settings",
                    requiresAuth: true
                }
            }
        ]
    }
]