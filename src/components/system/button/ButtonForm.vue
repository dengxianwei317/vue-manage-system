<template>
    <el-form ref="form" :model="entity" :rules="entityRules" label-width="100px" :disabled="formDisabled">
        <el-form-item label="按钮名称" prop="buttonName">
            <el-input v-model="entity.buttonName"></el-input>
        </el-form-item>
        <el-form-item label="点击事件" prop="clickEvent">
            <el-input v-model="entity.clickEvent"></el-input>
        </el-form-item>
        <el-form-item label="按钮类型" prop="buttonType">
            <el-select v-model="entity.buttonType" placeholder="请选择" style="width: 100%;">
                <el-option key="tableRow" label="表格行内按钮" value="tableRow"></el-option>
                <el-option key="toolBar" label="表格工具栏按钮" value="toolBar"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="按钮图标" prop="iconClass">
            <el-input v-model="entity.iconClass"></el-input>
        </el-form-item>
        <el-form-item label="按钮样式" prop="cssClass">
            <el-input v-model="entity.cssClass"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
            <el-input v-model="entity.sort"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "ButtonForm",
        data() {
            //检查按钮名称是否唯一
            let checkButtonName = (rule, value, callback) => {
                if (value !== null && value !== "") {
                    if (this.oldButtonName !== value) {
                        this.$api.getQs("/system/button/checkButton", {buttonName: value})
                            .then(res => {
                                if (res.data.data === true)
                                    callback(new Error('按钮名称已存在'));
                                else
                                    callback();
                            })
                            .catch(err => {
                                console.log(err.message);
                            });
                    } else
                        callback();
                } else
                    callback(new Error('按钮名称不能为空'));//验证是否通过必须要执行回调函数，否则无法提交表单
            };

            return {
                entity: {
                    id: null,
                    buttonName: null,
                    clickEvent: null,
                    buttonType: null,
                    iconClass: null,
                    cssClass: null,
                    sort: null
                },
                formDisabled: null,
                oldButtonName: null,
                entityRules: {
                    buttonName: [
                        {required: true, validator: checkButtonName, trigger: 'blur'}
                    ],
                    clickEvent: [
                        {required: true, message: '请输入点击事件', trigger: 'blur'}
                    ],
                    buttonType: [
                        {required: true, message: '请选择按钮类型', trigger: 'change'}
                    ],
                    iconClass: [
                        {required: true, message: '请输入按钮图标样式', trigger: 'blur'}
                    ],
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
                                path = "/system/button/add";
                            else
                                path = "/system/button/update";

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
                let id = this.$attrs.buttonId;
                let action = this.$attrs.action;
                let _this = this;

                if (action !== "add") {
                    this.$api.getQs("/system/button/select", {id: id})
                        .then(res => {
                            let data = res.data.data;
                            //对象字段存在对象或者集合时，直接将对象赋值，后端参数接收会出错
                            _this.$obj.setToObjValue(data, _this.entity);
                            _this.oldButtonName = _this.entity.buttonName;
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