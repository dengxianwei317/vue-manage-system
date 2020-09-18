<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="100px" :disabled="formDisabled">
        <el-form-item label="用户名" prop="userName">
            <el-input v-model="entity.userName" :disabled="inputDisabled"></el-input>
        </el-form-item>
        <el-form-item label="登录账号" prop="account">
            <el-input v-model="entity.account" :disabled="inputDisabled"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="sex">
            <el-select v-model="entity.sex" placeholder="请选择" style="width:100%">
                <el-option key="M" label="男" value="M"></el-option>
                <el-option key="W" label="女" value="W"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
            <el-date-picker v-model="entity.birthday" type="date" value-format="yyyy-MM-dd"
                            style="width:100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
            <el-input v-model="entity.phone"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
            <el-input v-model="entity.email"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "UserForm",
        data() {
            //检查注册登录账号是否唯一
            let checkAccount = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldAccount !== value) {
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
                    } else
                        callback();
                } else {
                    callback(new Error('登录账号不能为空'));
                }
            };

            //验证手机号码
            let checkPhone = function (rule, value, callback) {
                if (value !== null && value !== "") {
                    let reg = /^1[345789]\d{9}$/;
                    if (!reg.test(value)) {
                        callback(new Error('请输入11位有效手机号码'));
                    }
                } else
                    callback();
            };

            //验证邮箱格式
            let checkEmail = function (rule, value, callback) {
                if (value !== "" && value !== null) {
                    let reg = /^([a-zA-Z0-9._-])+@@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
                    if (!reg.test(value)) {
                        callback(new Error('请输入正确的邮箱格式'))
                    }
                } else
                    callback();
            };

            return {
                oldAccount: null,
                formDisabled: null,
                inputDisabled: null,
                entity: {
                    id: null,
                    userName: null,
                    account: null,
                    password: null,
                    sex: null,
                    phone: null,
                    email: null,
                    birthday: null
                },
                entityRules: {
                    userName: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    account: [
                        {required: true, validator: checkAccount, trigger: 'blur'}
                    ],
                    sex: [
                        {required: true, message: '请选择性别', trigger: 'change'}
                    ],
                    phone: [
                        {validator: checkPhone, trigger: 'blur'}
                    ],
                    email: [
                        {validator: checkEmail, trigger: 'blur'}
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
                            let action = _this.$attrs.action;
                            let path;
                            if (action === "add")
                                path = "/system/user/add";
                            else
                                path = "/system/user/update";

                            _this.$api.postQs(path, _this.entity)
                                .then(res => {
                                    if (res.data.code === 200) {
                                        isValid = true;
                                    }
                                    resolve(isValid);
                                })
                                .catch(err => {
                                    reject(err);
                                    console.log(err.message);
                                })
                        }
                    });
                });
            },
            initData() {
                let id = this.$attrs.userId;
                let action = this.$attrs.action;
                let _this = this;

                if (action !== "add") {
                    this.$api.getQs("/system/user/select", {id: id})
                        .then(res => {
                            let data = res.data.data;
                            //对象字段存在对象或者集合时，直接将对象赋值，后端参数接收会出错
                            _this.$obj.setToObjValue(data, _this.entity);
                            _this.oldAccount = _this.entity.account;
                        })
                        .catch(err => {
                            _this.$message.error("系统错误，数据加载失败");
                            console.log(err.message);
                        })
                }

                if (action === "view")
                    this.formDisabled = true;
                if (action === "edit")
                    this.inputDisabled = true;
            }
        },
        created() {
            this.$api.authentication(this.initData);
        }
    }
</script>

<style scoped>

</style>