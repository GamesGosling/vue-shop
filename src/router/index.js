import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/login.vue'
// import Home from '../components/home.vue'
// import Welcome from '../components/welcome.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/welcome.vue')
// import Users from '../components/user/users.vue'
// import Rights from '../components/power/rights.vue'
// import Roles from '../components/power/roles.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/users.vue')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/rights.vue')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/roles.vue')
// import Cate from '../components/goods/cate.vue'
// import Params from '../components/goods/params.vue'
// import GoodsList from '../components/goods/list.vue'
const Cate = () => import(/* webpackChunkName: "cate_params_goodsList" */ '../components/goods/cate.vue')
const Params = () => import(/* webpackChunkName: "cate_params_goodsList" */ '../components/goods/params.vue')
const GoodsList = () => import(/* webpackChunkName: "cate_params_goodsList" */ '../components/goods/list.vue')
// import Add from '../components/goods/add.vue'
// import Order from '../components/order/order.vue'
// import Report from '../components/report/report.vue'
const Add = () => import(/* webpackChunkName: "add_order_report" */ '../components/goods/add.vue')
const Order = () => import(/* webpackChunkName: "add_order_report" */ '../components/order/order.vue')
const Report = () => import(/* webpackChunkName: "add_order_report" */ '../components/report/report.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ] }
]

const router = new VueRouter({
  routes
})
// 挂载导航守卫 设置接口访问权限
router.beforeEach((to, from, next) => {
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login') {
    return next()
  }
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
