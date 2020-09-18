<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="100px" :disabled="formDisabled">
        <el-form-item label="权限名称" prop="name">
            <el-input v-model="entity.name"></el-input>
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
            <el-input v-model="entity.code"></el-input>
        </el-form-item>
        <el-form-item label="描述：" prop="description">
            <el-input type="textarea" autosize="{ minRows: 4, maxRows: 6}" v-model="entity.description"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "PermissionForm",
        data() {
            //检查code是否唯一
            let checkCode = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldCode !== value) {
                        this.$api.getQs("/system/permission/checkPermission", {code: value})
                            .then(res => {
                                if (res.data.data === true)
                                    callback(new Error('权限编码已存在'));
                                else
                                    callback();
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    } else
                        callback();
                } else
                    callback(new Error('权限编码不能为空'));//验证是否通过必须要执行回调函数，否则无法提交表单
            };

            //检查权限名称是否唯一
            let checkName = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldName !== value) {
                        this.$api.getQs("/system/permission/checkPermission", {name: value})
                            .then(res => {
                                if (res.data.data === true)
                                    callback(new Error('权限名称已存在'));
                                else
                                    callback();
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    } else
                        callback();
                } else
                    callback(new Error('权限名称不能为空'));//验证是否通过必须要执行回调函数，否则无法提交表单
            };

            return {
                entity: {
                    id: null,
                    name: null,
                    code: null,
                    description: null,
                    sort: null
                },
                formDisabled: null,
                oldCode: null,
                oldName: null,
                entityRules: {
                    name: [
                        {required: true, validator: checkName, trigger: 'blur'}
                    ],
                    code: [
                        {required: true, validator: checkCode, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            handleSubmit() {
                let _this = this;
                let isValid = false;
                let action = this.$attrs.action;

                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        if (valid) {
                            let path;
                            if (action === "add")
                                path = "/system/permission/add";
                            else
                                path = "/system/permission/update";

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
            },
            initData() {
                let id = this.$attrs.pId;
                let action = this.$attrs.action;
                let _this = this;

                if (action !== "add") {
                    this.$api.getQs("/system/permission/select", {id: id})
                        .then(res => {
                            let data = res.data.data;
                            //对象字段存在对象或者集合时，直接将对象赋值，后端参数接收会出错
                            _this.$obj.setToObjValue(data, _this.entity);
                            _this.oldCode = _this.entity.code;
                            _this.oldName = _this.entity.name;
                        })
                        .catch(err => {
                            _this.$message.error("系统错误，数据加载失败");
                            console.log(err.message);
                        })
                }

                if (action === "view")
                    this.formDisabled = true;
            }
        },
        created() {
            this.$api.authentication(this.initData);
        }
    }
</script>

<style scoped>

</style>