import Vue from 'vue'
import Router from 'vue-router'
import * as config from '@/config/settings'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer')
const Login = () => import('@/views/pages/Login')
const Register = () => import('@/views/pages/Register')
const PasswordReset = () => import('@/views/pages/PasswordReset')
const StoreRegister = () => import('@/views/pages/StoreRegister')

// Views
const Dashboard = () => import('@/views/Dashboard')
const RidesList  = () => import('@/views/Rides/List/List')
const RidesNew = () => import('@/views/Rides/New/New')
const PointsList = () => import('@/views/Points/List/List')
const PointsNew  = () => import('@/views/Points/New/New')
const CustomersNew  = () => import('@/views/Customers/New/New')
const CustomersList  = () => import('@/views/Customers/List/List')
const OrdersList  = () => import('@/views/Orders/List/List')
const OrdersNew = () => import('@/views/Orders/New/New')

Vue.use(Router)

export default new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/',
      redirect: 'dashboard',
      name: 'Home',
      component: DefaultContainer,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        }
      ]
    },
    {
      path: '/rides',
      name: 'Rides',
      component: DefaultContainer,
      children: [
        {
          path: 'list',
          name: 'RidesList',
          component: RidesList,
          meta: {
            label: 'Store Rides'
          }
        },
        {
          path: 'new',
          name: 'RidesNew',
          component: RidesNew,
          meta: {
            label: 'New Rides'
          }
        },
        {
          path: 'edit/:uuid',
          name: 'RidesNew',
          component: RidesNew,
          meta: {
            label: 'Edit product' 
          }
        }

      ]
    },
    {
      path: '/points',
      name: 'Points',
      component: DefaultContainer,
      children: [
        {
          path: 'list',
          name: 'PointsList',
          component: PointsList,
          meta: {
            label: 'Store Points'
          }
        },
        {
          path: 'new',
          name: 'PointsNew',
          component: PointsNew,
          meta: {
            label: 'New  Points'
          }
        },
        {
          path: 'edit/:uuid',
          name: 'PointsNew',
          component: PointsNew,
          meta: {
            label: 'Edit product' 
          }
        }

      ]
    },
    {
      path: '/orders',
      name: 'Orders',
      component: DefaultContainer,
      children: [
        {
          path: 'list',
          name: 'OrdersList',
          component: OrdersList,
          meta: {
            label: 'Store Orders'
          }
        },
        {
          path: 'new',
          name: 'OrdersNew',
          component: OrdersNew,
          meta: {
            label: 'New  Orders'
          }
        },
        {
          path: 'edit/:uuid',
          name: 'OrdersNew',
          component: OrdersNew,
          meta: {
            label: 'Edit Orders' 
          }
        }

      ]
    },
    {
      path: '/customers',
      name: 'Customers',
      component: DefaultContainer,
      children: [
        {
          path: 'list',
          name: 'CustomersList',
          component: CustomersList,
          meta: {
            label: 'Store Customers'
          }
        },
        {
          path: 'new',
          name: 'CustomersNew',
          component: CustomersNew,
          meta: {
            label: 'New Customers'
          }
        },
        {
          path: 'edit/:uuid',
          name: 'CustomersNew',
          component: CustomersNew,
          meta: {
            label: 'Edit product' 
          }
        }

      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/logout',
      name: 'Logout'
    }
  ]
})
