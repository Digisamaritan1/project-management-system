export default [
    {
        path: '/signin',
        name: 'Signin',
        // route level code-splitting
        // this generates a separate chunk (signin.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "Signin" */ '../views/Authentication/SigninForm/SigninForm.vue'),
        meta: {
            title: "Signin",
            requiresAuth: false,
        },
    },
    {
        path: '/forgot-password',
        name: 'Forgot_Password',
        component: () => import(/* webpackChunkName: "Forgot_Password" */ '../views/Authentication/ForgotPassword/ForgotPassword.vue'),
        meta: {
            title: 'Forgot Password',
            requiresAuth: false
        }
    },
    {
        path: '/reset-password/:token',
        name: 'Reset_Password',
        component: () => import(/* webpackChunkName: "Reset_Password" */ '../views/Authentication/ResetPassword/ResetPassword.vue'),
        meta: {
            title: 'Reset Password',
            requiresAuth: false
        }
    },
    {
        path: '/set-new-password/:token',
        name: 'Set_New_Password',
        component: () => import(/* webpackChunkName: "Reset_Password" */ '../views/Authentication/ResetPassword/SetNewPassword.vue'),
        meta: {
            title: 'Set New Password',
            requiresAuth: false
        }
    }
]