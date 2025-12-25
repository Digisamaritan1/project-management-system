const dashboardRouter = [{
    path: "/",
    name: "dashboard",
    component: () => import(/* webpackChunkName: "home" */ './views/Home'),
    meta: {
        title: 'Home',
        requiresAuth: true,
    }
},
{
    path: "/:cid",
    name: "Home",
    component: () => import(/* webpackChunkName: "home" */ './views/Home'),
    meta: {
        title: 'Home',
        requiresAuth: true,
    }
}];

export default {
    dashboardRouter
};
