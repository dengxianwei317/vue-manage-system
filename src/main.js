import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';


import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import {messages} from './components/common/i18n';
import './components/common/directives';
import 'babel-polyfill';
import Api from './utils/api';
import store from './store';
import objectUtils from "./utils/objectUtils";
import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' //这个样式必须引入

NProgress.inc(0.2)
NProgress.configure({easing: 'ease', speed: 500, showSpinner: false})

Vue.prototype.$api = Api;
Vue.prototype.$obj = objectUtils;
Vue.config.productionTip = false;


Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});

let _Vue = Vue;

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    document.title = '后台管理系统';
    NProgress.start();

    if (to.meta.requireAuth) {
        let token = _Vue.$cookies.get("token");
        if (!token) {
            next("/login");
        } else {
            //通信状态验证
            Api.get("/authentication")
                .then((res) => {
                    let data = res.data;
                    if (data.code === 200) {//token续签
                        let token = data.data.token;
                        let expireTime = data.data.expireTime;
                        let user = data.data.user;
                        _Vue.$cookies.remove("token");
                        _Vue.$cookies.set("token", token, expireTime);

                        if (window.vm.$store.state.permission.routes.length < 1) {
                            store.dispatch('permission/generateRoutes', user).then(res => {
                                store.commit("setUser", user);
                                next();
                            });
                        } else {
                            next();
                        }
                    } else if (data.code === 400) {//token无效
                        _Vue.$cookies.remove("token");
                        next("/login");
                        //NProgress.done();
                    } else {//token有效期
                        if (window.vm.$store.state.permission.routes.length < 1) {
                            store.dispatch('permission/generateRoutes', data).then(res => {
                                store.commit("setUser", data);
                                next();
                            });
                        } else {
                            next();
                        }
                    }
                })
                .catch(err => {
                    console.log(err.message);
                })
        }
    } else {
        next();
    }
});

router.afterEach((to, from) => {
    if (from.path === '/login') {
        window.vm.$store.state.loading.close();
        window.vm.$store.commit("resetLoading");
    }

    NProgress.done();
});

window.vm = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
}).$mount('#app');
