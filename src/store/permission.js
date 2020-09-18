import {asyncRouter} from '../router'
import router from '../router'
import api from "../utils/api";

let routers = [];

//根据菜单数据递归组装成路由
function createRoutes(data) {
    data.forEach(item => {
        if (item.componentPath) {
            if (item.routePath === '/systemIndex')
                item.routePath = item.routePath.replace('/', '');

            let route = {
                path: '/' + item.routePath,
                component: resolve => require([`@/components/${item.componentPath}`], resolve),
                meta: {title: item.name, requireAuth: item.isRequireAuth}
            };
            routers.push(route);
        }

        if (item.child) {
            createRoutes(item.child);
        }
    });

    return routers;
}

const permission = {
    namespaced: true,
    state: {
        routes: [],
        menus: []
    },

    mutations: {
        setMenuAndRouter: (state, menus) => {
            state.menus = menus;
            state.routes = asyncRouter;
        },
        resetMenuAndRouter: (state) => {
            state.menus = [];
            state.routes = [];
        }
    },

    actions: {
        generateRoutes({commit}, user) {
            return new Promise(resolve => {
                let listRoleId = [];

                user.listRole.forEach(role=>{
                    listRoleId.push(role.id);
                });

                //请求菜单接口
                api.getQs("/system/menu/getListPermissionMenu", {roleIds: listRoleId})
                    .then(res => {
                        if (res.data.code === 200) {
                            let routes = [];
                            routes = createRoutes(res.data.data);

                            asyncRouter.every(item => {
                                if (item.children) {
                                    item.children = routes;
                                    return false;
                                }

                                return true;
                            });

                            commit('setMenuAndRouter', res.data.data);

                            router.addRoutes(asyncRouter);
                            resolve(asyncRouter);
                        }
                    });
            })
        }
    },

    getters: {}
};

export default permission