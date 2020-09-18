<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="account">
                    <el-input v-model="param.account" placeholder="请输入登录账号">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                            type="password"
                            placeholder="password"
                            v-model="param.password"
                            @keyup.enter.native="login()"
                    >
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="login()">登录</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        data: function () {
            return {
                param: {
                    account: '',
                    password: '',
                },
                rules: {
                    account: [{required: true, message: '请输入用户名', trigger: 'blur'}],
                    password: [{required: true, message: '请输入密码', trigger: 'blur'}],
                },
            };
        },
        methods: {
            login() {
                let _this = this;
                this.$refs.login.validate(valid => {
                    if (valid) {
                        const loading = this.$loading({
                            lock: true,
                            text: '登录中...',
                            spinner: 'el-icon-loading',
                            background: 'rgba(0, 0, 0, 0.7)'
                        });

                        _this.$api.postQs('/login', _this.param).then(res => {
                            let data = res.data;
                            if (data.code === 200) {
                                let token = data.data.token;
                                let expireTime = data.data.expireTime;
                                _this.$cookies.set("token", token, expireTime * 60);
                                _this.$store.commit('setUser', data.data.user);
                                _this.$store.commit('setLoading', loading);
                                _this.$router.push('/');
                            } else {
                                _this.$message.warning("账号或密码不正确");
                            }
                        }).catch(err => {
                            console.log('error submit!!');
                        })
                    } else {
                        this.$message.error('请输入账号和密码');
                        return false;
                    }
                });
            },
        },
    };
</script>

<style scoped>
    .login-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        background-image: url(../../assets/img/login-bg.jpg);
        background-size: 100%;
    }

    .ms-title {
        width: 100%;
        line-height: 50px;
        text-align: center;
        font-size: 20px;
        color: #fff;
        border-bottom: 1px solid #ddd;
    }

    .ms-login {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 350px;
        margin: -190px 0 0 -175px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.3);
        overflow: hidden;
    }

    .ms-content {
        padding: 30px 30px;
    }

    .login-btn {
        text-align: center;
    }

    .login-btn button {
        width: 100%;
        height: 36px;
        margin-bottom: 10px;
    }

    .login-tips {
        font-size: 12px;
        line-height: 30px;
        color: #fff;
    }
</style>