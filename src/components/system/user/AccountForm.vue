<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="100px" :disabled="formDisabled">
        <el-form-item label="新用户名" prop="userName">
            <el-input v-model="entity.userName"></el-input>
        </el-form-item>
        <el-form-item label="新登录账号" prop="account">
            <el-input v-model="entity.account"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="password">
            <el-input type="password" v-model="entity.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="twoPassword">
            <el-input type="password" v-model="entity.twoPassword"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "AccountForm",
        data() {
            //检查注册登录账号是否唯一
            let checkAccount = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    this.$api.getQs("/system/user/checkAccount", {account: value})
                        .then(res => {
                            if (res.data.data === true)
                                callback(new Error('登录账号已存在'));
                            else
                                callback();
                        })
                        .catch(err => {
                            console.log(err.message);
                        });
                } else {
                    callback();
                }
            };

            let checkPassword = (rule, value, callback) => {
                if (value === null && value === "") {
                    callback(new Error('请输入确认密码'));
                } else {
                    if (value !== this.entity.password)
                        callback(new Error('两次输入的密码不一致'));
                    else
                        callback();
                }
            };

            return {
                entity: {
                    id: null,
                    userName: null,
                    account: null,
                    password: null,
                    twoPassword: null
                },
                entityRules: {
                    account: [
                        {validator: checkAccount, trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入新密码', trigger: 'blur'}
                    ],
                    twoPassword: [
                        {required: true, validator: checkPassword, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            handleSubmit() {
                let _this = this;
                let isValid = false;

                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        if (valid) {
                            let path = "/system/user/updateAccount";

                            _this.$api.postQs(path, _this.entity)
                                .then(res => {
                                    if (res.data.code === 200) {
                                        isValid = true;
                                    }
                                    resolve(isValid);
                                })
                                .catch(err => {
                                    reject(err);
                                })
                        }
                    });
                });
            }
        },
        created() {
            this.entity.id = this.$attrs.userId;
        }
    }
</script>

<style scoped>

</style>