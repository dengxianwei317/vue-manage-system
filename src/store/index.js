import Vue from 'vue'
import Vuex from 'vuex'
import permission from "./permission";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        permission
    },
    state: {
        user: null,
        menuId: null,
        loading: null
    },
    mutations: {
        setUser(state, data) {
            state.user = data;
        },
        resetUser(state) {
            // 清除user里的内容
            state.user = null;
        },
        setMenuId(state, data) {
            state.menuId = data;
        },
        setLoading(state, data) {
            state.loading = data;
        },
        resetLoading(state){
            state.loading = null;
        }
    }
})