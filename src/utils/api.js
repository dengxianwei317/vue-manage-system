import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';
import VueCookies from 'vue-cookies';

Vue.use(VueCookies);

axios.defaults.baseURL = 'http://localhost:9090/api';
//跨域请求允许携带凭证信息
axios.defaults.withCredentials = true;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// 添加请求拦截器，在请求头中加token
axios.interceptors.request.use(
    config => {
        if (Vue.$cookies.get("token")) {
            config.headers.token = Vue.$cookies.get("token");
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    });

function get(apiPath, params) {
    let request = axios.get(apiPath, {
        params: params
    });
    return request;
}

function getQs(apiPath, params) {
    let request = axios.get(apiPath, {
        params: params,
        paramsSerializer: params => {
            return qs.stringify(params, {indices: false})
        }
    });
    return request;
}

function post(apiPath, params, config) {
    let request = axios.post(apiPath, params, config);
    return request;
}

function postQs(apiPath, params, config) {
    let request = axios.post(apiPath, qs.stringify(params, {indices: false}), config);
    return request;
}

function put(apiPath, params, config) {
    let request = axios.put(apiPath, params, config);
    return request;
}

function putQs(apiPath, params, config) {
    let request = axios.put(apiPath, qs.stringify(params, {indices: false}), config);
    return request;
}

function deleteHttp(apiPath, params) {
    let request = axios.delete(apiPath, {
        params: params
    });
    return request;
}

function deleteQs(apiPath, params) {
    let request = axios.delete(apiPath, {
        params: params,
        paramsSerializer: params => {
            return qs.stringify(params, {indices: false})
        }
    });
    return request;
}

let _Vue = Vue;

function authentication(func) {
    return new Promise((resolve, reject) => {
        get("/authentication").then(res => {
            let data = res.data;
            if (data.code === 200) {//token续签
                let token = data.data.token;
                let expireTime = data.data.expireTime;
                _Vue.$cookies.remove("token");
                _Vue.$cookies.set("token", token, expireTime);

                if (func) {
                    resolve(func());
                }
            } else if (data.code === 400) {//token无效
                _Vue.$cookies.remove("token");
                window.vm.$router.replace("/login");
            } else {//token有效期
                if (func) {
                    resolve(func());
                }
            }
        }).catch(err => {
            console.log(err.message);
        })
    });
}

/**
 * 请求结果处理
 * @param axiosRequest
 * @param successCallback
 * @param errorCallback
 */
function thenResponse(axiosRequest, successCallback, errorCallback) {
    axiosRequest.then((res) => {
            if (successCallback) successCallback(res);
        }
    ).catch((error) => {
        if (errorCallback) errorCallback(error);
    })
}

export default {
    get: function (apiPath, params) {
        return get(apiPath, params);
    },
    getQs: function (apiPath, params) {
        return getQs(apiPath, params);
    },
    post: function (apiPath, params, config) {
        return post(apiPath, params, config);
    },
    postQs: function (apiPath, params, config) {
        return postQs(apiPath, params, config);
    },
    put: function (apiPath, params, config) {
        return put(apiPath, params, config);
    },
    putQs: function (apiPath, params) {
        return putQs(apiPath, params);
    },
    deleteHttp: function (apiPath, params) {
        return deleteHttp(apiPath, params);
    },
    deleteQs: function (apiPath, params) {
        return deleteQs(apiPath, params);
    },
    //接口身份认证
    authentication: function (func) {
        return authentication(func);
    }
}