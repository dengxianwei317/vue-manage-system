<template>
    <el-container style="border: 1px solid #eee;height: 100%;">
        <el-aside width="220px">
            <el-tree :data="treeData" :props="defaultProps" default-expand-all="true"
                     @node-click="treeNodeClick" @check="treeNodeCheck"
                     ref="tree" node-key="id" show-checkbox accordion
                     expand-on-click-node="true" highlight-current="true">
            </el-tree>
        </el-aside>
        <el-container>
            <el-main style="background-color: #F5F7FA;height: 420px;">
                <div style="font-size: 20px">[{{checkedMenuName}}]页面按钮配置：</div>
                <el-transfer v-model="listButtonValue" :data="listButton" style="margin: 20px"
                             filterable filter-placeholder="请输入按钮名称"
                             :filter-method="filterButton" :right-default-checked="rightCheckedButtons"
                             :titles="['待选按钮', '已选按钮']" :props="{key: 'id', label: 'buttonName'}"
                             @change="changeButton">
                </el-transfer>
            </el-main>
            <el-footer style="background-color: #fbfdff;height: 200px;">

            </el-footer>
        </el-container>
    </el-container>
</template>

<script>
    export default {
        name: "RolePermission",
        data() {
            return {
                treeData: [],
                defaultProps: {
                    children: 'child',
                    label: 'name'
                },
                roleId: null,
                //菜单参数
                checkedKeys: [],
                listAddMenuId: [],
                listDeleteMenuId: [],

                checkedMenuId: null,
                checkedMenuName: '',

                rightCheckedButtons: [],//设置新增为选择状态
                listButton: [],
                listButtonValue: [],
                //按钮参数
                mapCheckedButton: new Map(),
                mapAddButton: new Map(),
                mapDeleteButton: new Map(),
                filterButton(query, item) {
                    return item.buttonName.indexOf(query) > -1;
                }
            }
        },
        methods: {
            changeButton(value, direction, movedKeys) {//右侧列表元素变化时触发
                let _this = this;
                if (this.checkedMenuId !== null) {
                    let listCheckedButtonId = [];
                    let listAddButtonId = [];
                    let listDeleteButtonId = [];

                    if (direction === 'right') {//添加
                        if (!this.mapCheckedButton.has(this.checkedMenuId)) {
                            this.mapAddButton.set(this.checkedMenuId, value);
                            this.rightCheckedButtons = value;
                        } else {
                            listCheckedButtonId = this.mapCheckedButton.get(this.checkedMenuId);
                            let listAdd = [];

                            value.forEach(buttonId => {
                                if (!listCheckedButtonId.includes(buttonId)) {//默认分配的按钮是否包含新增的
                                    listAdd.push(buttonId);
                                }
                            });

                            this.rightCheckedButtons = listAdd;
                            this.mapAddButton.set(this.checkedMenuId, listAdd);

                            if (this.mapDeleteButton.has(this.checkedMenuId)) {
                                listDeleteButtonId = this.mapDeleteButton.get(this.checkedMenuId);

                                movedKeys.forEach(buttonId => {
                                    let index = listDeleteButtonId.indexOf(buttonId);
                                    if (index >= 0)
                                        listDeleteButtonId.splice(index, 1);
                                });

                                if (listDeleteButtonId.length > 0) {
                                    this.mapDeleteButton.set(this.checkedMenuId, listDeleteButtonId);
                                } else
                                    this.mapDeleteButton.delete(this.checkedMenuId);
                            }
                        }
                    } else {//移除
                        if (this.mapCheckedButton.has(this.checkedMenuId)) {
                            listCheckedButtonId = this.mapCheckedButton.get(this.checkedMenuId);
                            listDeleteButtonId = [];

                            movedKeys.forEach(buttonId => {
                                if (listCheckedButtonId.includes(buttonId))
                                    listDeleteButtonId.push(buttonId);
                            });

                            if (listDeleteButtonId.length > 0) {
                                if (!this.mapDeleteButton.has(this.checkedMenuId)) {
                                    this.mapDeleteButton.set(this.checkedMenuId, listDeleteButtonId);
                                } else {
                                    let listId = this.mapDeleteButton.get(this.checkedMenuId);
                                    listDeleteButtonId = listDeleteButtonId.concat(listId);
                                    this.mapDeleteButton.set(this.checkedMenuId, listDeleteButtonId);
                                }
                            }

                            if (this.mapAddButton.has(this.checkedMenuId)) {
                                listAddButtonId = [];
                                value.forEach(buttonId => {//右边剩下的数据是否包含在默认选择中
                                    if (!listCheckedButtonId.includes(buttonId))
                                        listAddButtonId.push(buttonId);
                                });

                                if (listAddButtonId.length > 0)
                                    this.mapAddButton.set(this.checkedMenuId, listAddButtonId);
                                else
                                    this.mapAddButton.delete(this.checkedMenuId);

                                this.rightCheckedButtons = listAddButtonId;
                            }
                        } else {
                            if (this.mapAddButton.has(this.checkedMenuId)) {
                                if (value.length > 0)
                                    this.mapAddButton.set(this.checkedMenuId, value);
                                else
                                    this.mapAddButton.delete(this.checkedMenuId);

                                this.rightCheckedButtons = value;
                            }
                        }
                    }
                } else {
                    this.listButtonValue = [];
                    this.$message.warning("请选择要配置按钮的菜单节点");
                }
            },
            treeNodeClick(node) {//节点点击事件
                let _this = this;
                if (node.componentPath !== "" && node.routePath !== "/systemIndex") {//点击的节点为页面
                    this.checkedMenuId = node.id;
                    this.checkedMenuName = node.name;
                    if (this.mapCheckedButton.has(this.checkedMenuId)) {
                        let listAddButtonId = [];
                        let listDeleteButtonId = [];
                        let listCheckedButtonId = this.mapCheckedButton.get(this.checkedMenuId);

                        if (this.mapAddButton.has(this.checkedMenuId))
                            listAddButtonId = this.mapAddButton.get(this.checkedMenuId);

                        if (this.mapDeleteButton.has(this.checkedMenuId))
                            listDeleteButtonId = this.mapDeleteButton.get(this.checkedMenuId);

                        if (listAddButtonId.length > 0 && listDeleteButtonId.length < 1) {
                            this.listButtonValue = listCheckedButtonId.concat(listAddButtonId);
                            this.rightCheckedButtons = listAddButtonId;
                        } else if (listDeleteButtonId.length > 0 && listAddButtonId.length < 1) {
                            listDeleteButtonId.forEach(buttonId => {
                                let index = listCheckedButtonId.indexOf(buttonId);

                                if (index >= 0)
                                    listCheckedButtonId.splice(index, 1);
                            });
                            this.listButtonValue = listCheckedButtonId;
                            this.rightCheckedButtons = [];
                        } else if (listAddButtonId.length > 0 && listDeleteButtonId.length > 0) {
                            listDeleteButtonId.forEach(buttonId => {
                                let index = listCheckedButtonId.indexOf(buttonId);

                                if (index >= 0)
                                    listCheckedButtonId.splice(index, 1);
                            });

                            this.listButtonValue = listCheckedButtonId.concat(listAddButtonId);
                        } else {
                            this.rightCheckedButtons = [];
                            this.listButtonValue = listCheckedButtonId;
                        }
                    } else {
                        //加载菜单页面已配置的按钮
                        this.$api.getQs("/system/roleMenuButton/getCheckedList", {
                            'roleId': this.roleId,
                            'menuId': node.id
                        }).then(res => {
                            if (res.data.code === 200) {
                                let data = res.data.data;
                                data = data === null ? [] : data;
                                _this.listButtonValue = [];
                                if (data.length > 0) {
                                    data.forEach(item => {
                                        _this.listButtonValue.push(item.buttonId);
                                    });
                                    _this.mapCheckedButton.set(_this.checkedMenuId, _this.listButtonValue);
                                    _this.rightCheckedButtons = [];
                                } else {
                                    if (_this.mapAddButton.has(_this.checkedMenuId)) {
                                        _this.listButtonValue = _this.mapAddButton.get(_this.checkedMenuId);
                                        _this.rightCheckedButtons = _this.listButtonValue;
                                    } else {
                                        _this.listButtonValue = [];
                                        _this.rightCheckedButtons = [];
                                    }

                                }
                            }
                        }).catch(err => {
                            _this.$message.error("系统错误，数据加载失败");
                            console.log(err.message);
                        });
                    }
                }
            },
            treeNodeCheck(data, array) {//当复选框被点击的时候触发
                let _this = this;
                let checkedMenuIds = this.checkedKeys;
                let _checkedKeys = array.checkedKeys;

                //将半选中的添加进来
                if (array.halfCheckedKeys.length > 0) {
                    _checkedKeys = _checkedKeys.concat(array.halfCheckedKeys);
                }

                //加载完成已选择的数据
                if (checkedMenuIds.length < 1)
                    this.listAddMenuId = _checkedKeys;
                else {
                    _checkedKeys.forEach(item => {
                        if (!checkedMenuIds.includes(item) && !_this.listAddMenuId.includes(item)) {
                            _this.listAddMenuId.push(item);
                        }
                    });

                    checkedMenuIds.forEach(item => {
                        if (!_checkedKeys.includes(item) && !_this.listDeleteMenuId.includes(item)) {
                            _this.listDeleteMenuId.push(item);
                        }
                    });
                }
            },
            handleSubmit() {
                let _this = this;
                let isOK = false;

                /*if (this.listAddMenuId.length < 1 && this.listDeleteMenuId.length < 1) {
                    this.$message.warning("未选择数据无法提交");
                    return;
                }*/

                return new Promise((resolve, reject) => {
                    _this.$api.postQs("/system/roleMenu/addAndDelete", {
                        roleId: _this.roleId,
                        addMenuIds: _this.listAddMenuId,
                        deleteMenuIds: _this.listDeleteMenuId,
                    }).then(res => {
                        if (res.data.code === 200) {
                            isOK = true;
                            _this.submitButtonMenu();
                        }

                        resolve(isOK);
                    }).catch(err => {
                        reject(err);
                    })
                });
            },
            submitButtonMenu() {//提交分配按钮数据
                let listAddButtonId = [];
                let listDeleteButtonId = [];
                let _this = this;
                this.mapAddButton.forEach((value, key) => {
                    let object = {roleId: _this.roleId, menuId: key, buttonIds: value};
                    listAddButtonId.push(object);
                });

                this.mapDeleteButton.forEach((value, key) => {
                    let object = {roleId: _this.roleId, menuId: key, buttonIds: value};
                    listDeleteButtonId.push(object);
                });

                this.$api.post("/system/roleMenuButton/batchAddAndDelete", {
                    'listAdd': listAddButtonId,
                    'listDelete': listDeleteButtonId,
                }).then(res => {

                }).catch(err => {
                    console.log(err.message);
                });
            },
            getCheckedMenus() {
                let _this = this;

                this.$api.getQs("/system/roleMenu/getCheckedList", {roleId: this.roleId})
                    .then(res => {
                        if (res.data.code === 200) {
                            let data = res.data.data;
                            data = data === null ? [] : data;

                            if (data.length > 0) {
                                data.forEach(item => {
                                    _this.checkedKeys.push(item.menuId);
                                    _this.$refs.tree.setChecked(item.menuId, true, false); //设置选中的状态
                                });
                            }
                        }
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    });
            },
            getListButton() {
                let _this = this;
                this.$api.getQs("/system/button/getList")
                    .then(res => {
                        if (res.data.code === 200)
                            _this.listButton = res.data.data;
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    })
            },
            getListTreeMenu() {
                let _this = this;
                this.roleId = this.$attrs.roleId;

                this.$api.getQs("/system/menu/getListTreeMenu")
                    .then(res => {
                        if (res.data.code === 200) {
                            _this.treeData = res.data.data;
                            _this.getCheckedMenus();
                            _this.getListButton();
                        }
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    });
            }
        },
        created() {
            this.$api.authentication(this.getListTreeMenu);
        }
    }
</script>

<style scoped>
    .el-transfer-panel__body {
        height: 380px;
    }

    .el-transfer-panel__list.is-filterable {
        height: 380px;
    }

    .el-transfer-panel {
        width: 300px;
        height: 380px;
    }
</style>