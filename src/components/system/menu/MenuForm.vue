<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="100px" :disabled="formDisabled">
        <el-form-item label="上级菜单" prop="parentName">
            <el-select v-model="entity.parentName" placeholder="请选择" style="width:100%;">
                <el-option :value="optionValue" style="height: auto;">
                    <el-tree :data="treeData" :props="defaultProps" ref="menuTree" accordion @node-click="nodeClick">
                    </el-tree>
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
            <el-input v-model="entity.name"></el-input>
        </el-form-item>
        <el-form-item label="路由地址" prop="routePath">
            <el-input v-model="entity.routePath"></el-input>
        </el-form-item>
        <el-form-item label="路由认证" prop="isRequireAuth">
            <el-select v-model="entity.isRequireAuth" placeholder="请选择" style="width: 100%;">
                <el-option key="1" label="是" value=1></el-option>
                <el-option key="0" label="否" value=0></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="菜单样式" prop="iconClass">
            <el-input v-model="entity.iconClass"></el-input>
        </el-form-item>
        <el-form-item label="页面路径" prop="componentPath">
            <el-input v-model="entity.componentPath"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
            <el-input v-model="entity.sort"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "MenuForm",
        data() {
            //检查路由地址是否唯一
            let checkRoutePath = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldRoutePath !== value) {
                        this.$api.getQs("/system/menu/checkRoutePath", {routePath: value})
                            .then(res => {
                                if (res.data.data === true)
                                    callback(new Error('路由地址已存在'));
                                else
                                    callback();
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    } else
                        callback();
                } else
                    callback();//验证是否通过必须要执行回调函数，否则无法提交表单
            };

            return {
                entity: {
                    id: null,
                    routePath: null,
                    name: null,
                    isRequireAuth: null,
                    iconClass: null,
                    componentPath: null,
                    parentId: null,
                    parentName: null,
                    menuCode: null,
                    sort: null
                },
                formDisabled: null,
                oldRoutePath: null,
                optionValue: [],
                treeData: [],
                defaultProps: {
                    children: 'child',
                    label: 'name'
                },
                entityRules: {
                    name: [
                        {required: true, message: '请输入菜单名称', trigger: 'blur'}
                    ],
                    routePath: [
                        {validator: checkRoutePath, trigger: 'blur'}
                    ],
                    isRequireAuth: [
                        {required: true, message: '请选择路由认证', trigger: 'change'}
                    ]
                }
            }
        },
        methods: {
            nodeClick(data) {//节点点击事件
                this.entity.parentName = data.name;
                this.entity.parentId = data.id;
                this.entity.menuCode = data.menuCode;
            },
            handleSubmit() {
                let _this = this;
                let isValid = false;
                let action = this.$attrs.action;

                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(valid => {
                        if (valid) {
                            let path;
                            if (action === "add")
                                path = "/system/menu/add";
                            else
                                path = "/system/menu/update";

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
                let id = this.$attrs.menuId;
                let action = this.$attrs.action;
                let _this = this;

                this.treeData = this.$store.state.permission.menus;

                if (action !== "add") {
                    this.$api.getQs("/system/menu/select", {id: id})
                        .then(res => {
                            let data = res.data.data;
                            //对象字段存在对象或者集合时，直接将对象赋值，后端参数接收会出错
                            _this.$obj.setToObjValue(data, _this.entity);
                            _this.oldRoutePath = _this.entity.routePath;
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