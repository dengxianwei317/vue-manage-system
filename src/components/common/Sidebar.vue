<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" ref="menuRef" :default-active="onRoutes" :collapse="collapse"
                 background-color="#324157"
                 text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router @select="handleSelect">
            <template v-for="item in items">
                <template v-if="item.child">
                    <el-submenu :index="item.routePath" :key="item.id">
                        <template slot="title">
                            <i :class="item.iconClass"></i>
                            <span slot="title">{{ item.name }}</span>
                        </template>

                        <template v-for="subItem in item.child">
                            <template v-if="subItem.child">
                                <el-submenu :index="subItem.routePath" :key="subItem.id">
                                    <template slot="title">{{ subItem.name }}</template>

                                    <template v-for="threeItem in subItem.child">
                                        <template v-if="threeItem.child">
                                            <el-submenu :index="threeItem.routePath" :key="threeItem.id">
                                                <template slot="title">{{ threeItem.name }}</template>

                                                <template v-for="childItem in threeItem.child">
                                                    <template v-if="childItem.child">
                                                        <el-submenu :index="childItem.routePath" :key="childItem.id">
                                                            <template slot="title">{{ childItem.name }}</template>
                                                        </el-submenu>
                                                    </template>

                                                    <template v-else>
                                                        <el-menu-item :key="childItem.id" :index="childItem.routePath">
                                                            {{ childItem.name }}
                                                        </el-menu-item>
                                                    </template>
                                                </template>
                                            </el-submenu>
                                        </template>

                                        <template v-else>
                                            <el-menu-item :key="threeItem.id" :index="threeItem.routePath">
                                                {{ threeItem.name }}
                                            </el-menu-item>
                                        </template>
                                    </template>
                                </el-submenu>
                            </template>

                            <template v-else>
                                <el-menu-item :index="subItem.routePath" :key="subItem.id">
                                    {{ subItem.name }}
                                </el-menu-item>
                            </template>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.routePath" :key="item.id">
                        <i :class="item.iconClass"></i>
                        <span slot="title">{{ item.name }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
    import bus from '../common/bus';

    export default {
        data() {
            return {
                collapse: false,
                items: []
            };
        },
        methods: {
            handleSelect(index, indexPath, event) {
                this.$store.commit("setMenuId", event.$vnode.data.key);
            },
            initData() {
                if (this.$store.state.permission.menus.length > 0) {
                    this.items = this.$store.state.permission.menus;
                }
            }
        },
        computed: {
            onRoutes() {
                return this.$route.path.replace('/', '');
            }
        },
        created() {
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
                bus.$emit('collapse-content', msg);
            });

            this.initData();
        }
    };
</script>

<style scoped>
    .sidebar {
        display: block;
        position: absolute;
        left: 0;
        top: 70px;
        bottom: 0;
        overflow-y: scroll;
    }

    .sidebar::-webkit-scrollbar {
        width: 0;
    }

    .sidebar-el-menu:not(.el-menu--collapse) {
        width: 250px;
    }

    .sidebar > ul {
        height: 100%;
    }
</style>
