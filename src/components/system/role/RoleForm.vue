<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="120px" :disabled="formDisabled">
        <el-form-item label="角色英文名称" prop="roleName">
            <el-input v-model="entity.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色中文名称" prop="roleNameZh">
            <el-input v-model="entity.roleNameZh"></el-input>
        </el-form-item>
        <el-form-item label="能否被继承" prop="isInherit">
            <el-select v-model="entity.isInherit" placeholder="请选择" style="width:100%">
                <el-option key="1" label="是" value="1"></el-option>
                <el-option key="0" label="否" value="0"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="描述：" prop="description">
            <el-input type="textarea" autosize="{ minRows: 4, maxRows: 6}" v-model="entity.description"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "RoleForm",
        data() {
            //检查角色名称是否唯一
            let checkRoleName = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldName !== value) {
                        this.$api.getQs("/system/role/checkRoleName", {name: value})
                            .then(res => {
                                if (res.data.data === true)
                                    callback(new Error('角色名称已存在'));
                                else
                                    callback();
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    } else
                        callback();
                } else {
                    callback(new Error('角色名称不能为空'));
                }
            };

            return {
                oldName: null,
                formDisabled: null,
                entity: {
                    id: null,
                    roleName: null,
                    roleNameZh: null,
                    isInherit: null,
                    description: null
                },
                entityRules: {
                    roleName: [
                        {required: true, validator: checkRoleName, trigger: 'blur'}
                    ],
                    roleNameZh: [
                        {required: true, message: '请输入角色中文名称', trigger: 'blur'}
                    ],
                    isInherit: [
                        {required: true, message: '请选择角色能否被继承', trigger: 'change'}
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
                                path = "/system/role/add";
                            else
                                path = "/system/role/update";

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
                let id = this.$attrs.roleId;
                let action = this.$attrs.action;
                let _this = this;

                if (action !== "add") {
                    this.$api.getQs("/system/role/select", {id: id})
                        .then(res => {
                            let data = res.data.data;
                            //对象字段存在对象或者集合时，直接将对象赋值，后端参数接收会出错
                            _this.$obj.setToObjValue(data, _this.entity);
                            _this.oldName = _this.entity.roleName;
                        })
                        .catch(err => {
                            _this.$message.error("系统错误，数据加载失败");
                            console.log(err.message);
                        })
                }

                if (action === "view")
                    this.formDisabled = true;
            }
        }
        ,
        created() {
            this.$api.authentication(this.initData);
        }
    }
</script>

<style scoped>

</style>