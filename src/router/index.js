import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export var asyncRouter = [
    {
        path: '/',
        redirect: '/systemIndex'
    },
    {
        path: '/', //import('../components/common/Home'),
        component: resolve => require(['@/components/common/Home'], resolve),
        meta: {title: 'home主页', requireAuth: true},
        children:
            [
                {
                    path: '/systemIndex',
                    component: resolve => require(['@/components/system/SystemIndex'],resolve),
                    meta: {title: '系统首页', requireAuth: true}
                }
            ]
    },
    {
        path: '/login',
        component: resolve => require(['@/components/system/Login'], resolve),
        meta: {title: '登录'}
    },
    {
        path: '*',
        redirect: '/systemIndex'
    }
];

export default new Router({
    mode: 'history',
    scrollBehavior: () => ({y: 0}),
    routes: asyncRouter
})


