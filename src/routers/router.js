import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import EmptyLayout from '@/layouts/EmptyLayout.vue';
import Cart from '../views/Cart.vue'
import Profile from '@/views/Profile.vue';
import Favorite from '../views/Favorite.vue';
import Comment from '../views/Comment.vue';
import Room from '../views/Room.vue';
import FavoriteList from '../views/FavoriteList.vue';

import RoomCreate from '../views/RoomCreate.vue';
import UserOrderDetail from '../components/order/UserOrderDetail.vue';
import ProviderSalesReport from '../components/order/ProviderSalesReport.vue';
import UserCheckOrder from '../components/order/UserCheckOrder.vue';
import ProviderCheckOrder from '../components/order/ProviderCheckOrder.vue';
import UserRefundRequest from '../components/order/UserRefundRequest.vue';
import ProviderActiveRefundOrder from '../components/order/ProviderActiveRefundOrder.vue';
import UserUnpaidOrder from '../components/order/UserUnpaidOrder.vue';
import CkeckOutDetail from '../components/cart/CkeckOutDetail.vue';
const routes = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'Home-link',
                component: Home,
            },
            {
                path: "cart",
                name: "cart-link",
                component: Cart
            },
            {
                path: "cartCheckOut",
                name: "cart-checkout-link",
                component: CkeckOutDetail,
                props: true
            },
            {
                path: 'profile',
                name: 'profile-link',
                component: Profile,
                children: [
                    {
                        path: 'info',
                        name: 'profileinfo-link',
                        component: () => import('../components/profile/ProfileInfo.vue')
                    },
                    {
                        path: 'provider/register',
                        name: 'registerProvider-link',
                        component: () => import('../components/profile/RegisterProvider.vue')
                    },
                    {
                        path: 'provider/info',
                        name: 'providerInfo-link',
                        component: () => import('../components/profile/ProviderInfo.vue')
                    },
                ]
            },
            {
                path: "favorite",
                name: "favorite-link",
                component: Favorite
            },
            {
                path: "favorite/:city",
                name: "favorite-link",
                component: Favorite,
                props: true,
            },
            {
                path: "favoriteList",
                name: "favoriteList-link",
                component: FavoriteList
            },
            {
                path: '/order',
                children: [{
                    path: 'orderDetail/:id',
                    name: 'OrderDetail',
                    component: UserOrderDetail,
                    props: true
                },
                {
                    path: 'userCheckOrder',
                    component: UserCheckOrder,

                },
                {
                    path: 'userRefundRequest',
                    component: UserRefundRequest,

                },
                {
                    path: 'userUnpaidOrder',
                    component: UserUnpaidOrder,
                }, {
                    path: 'userReservedRooms',
                    component: () => import('../components/order/UserReservedRoom.vue'),
                }

                ]
            },
            {
                path: '/provOrder',
                children: [
                    {
                        path: 'salesReport',
                        component: ProviderSalesReport,
                    },
                    {
                        path: 'providerCheckOrder',
                        component: ProviderCheckOrder,
                    },
                    {
                        path: 'providerActiveRefundOrder',
                        component: ProviderActiveRefundOrder,
                    },
                    {
                        path: 'providerPastRefundOrder',
                        name: 'providerPastRefundOrder',
                        component: () => import('../components/order/ProviderPastRefundOrder.vue'),
                    },
                    {
                        path: 'providerReservedRooms',
                        name: 'providerReservedRooms',
                        component: () => import('../components/order/ProviderReservedRoom.vue'),
                    }
                ]
            },
            {
                path: "room/:roomId",
                name: "room-link",
                component: Room,
                props: true,
            },
            {
                path: "comment/:orderId",
                name: "comment-link",
                component: Comment,
                props: true,
            },
            {
                path: "/roomCreate",
                name: "room-create-link",
                component: RoomCreate,
                children: [
                    {
                        path: 'roomlist',
                        name: 'roomlist',
                        component: () => import('../components/Room/RoomList.vue'),
                    },
                    {
                        path: 'first',
                        name: 'create-first',
                        component: () => import('../components/Room/CreateRoom/First.vue'),
                    },
                    {
                        path: 'step-one',
                        name: 'step-one',
                        component: () => import('../components/Room/CreateRoom/Step1.vue'),
                    },
                    {
                        path: 'step-two/:roomId',
                        name: 'step-two',
                        component: () => import('../components/Room/CreateRoom/Step2.vue'),
                    },
                    {
                        path: 'step-three/:roomId',
                        name: 'step-three',
                        component: () => import('../components/Room/CreateRoom/Step3.vue'),
                    },
                    {
                        path: 'step-four/:roomId',
                        name: 'step-four',
                        component: () => import('../components/Room/CreateRoom/Step4.vue'),
                    },
                    {
                        path: 'step-five/:roomId',
                        name: 'step-five',
                        component: () => import('../components/Room/CreateRoom/Step5.vue'),
                    },
                    {
                        path: 'finish',
                        name: 'create-finish',
                        component: () => import('../components/Room/CreateRoom/Finish.vue'),
                    },
                    {
                        path: 'modify-room/:roomId',
                        name: 'modify-room',
                        component: () => import('../components/Room/CreateRoom/ModifyRoom.vue'),
                    },
                    {
                        path: 'available-date',
                        name: 'available-date',
                        component: () => import('../components/Room/Date/AvailableDate.vue'),
                        props: true,
                    },
                    {
                        path: 'each-available-date',
                        name: 'each-available-date',
                        component: () => import('../components/Room/Date/EachAvailableDate.vue'),
                        props: true,
                    },
                ],
            },

            // 其他使用 DefaultLayout 的路由
        ],
    },
    {
        path: '/auth',
        component: EmptyLayout,
        children: [
            {
                path: 'login',
                name: 'Login-link',
                component: () => import('@/views/auth/Login.vue'),
            },
            {
                path: 'register',
                name: 'register-link',
                component: () => import('@/views/auth/Register.vue'),
            },
            {
                path: 'forgotPassword',
                name: 'forgotPassword-link',
                component: () => import('@/views/auth/ForgotPassword.vue'),
            },
            {
                path: 'resetPassword',
                name: 'resetPassword-link',
                component: () => import('@/views/auth/ResetPassword.vue'),
            },
            {
                path: 'emailVerification',
                name: 'emailVerification-link',
                component: () => import('@/views/auth/EmailVerification.vue'),
            },
            {
                path: 'updatePassword',
                name: 'updatePassword-link',
                component: () => import('@/views/auth/UpdatePassword.vue')
            },
            {
                path: 'register',
                name: 'register-link',
                component: () => import('@/views/auth/Register.vue'),
            },
            {
                path: 'forgotPassword',
                name: 'forgotPassword-link',
                component: () => import('@/views/auth/ForgotPassword.vue'),
            },
            {
                path: 'resetPassword',
                name: 'resetPassword-link',
                component: () => import('@/views/auth/ResetPassword.vue'),
            },
            {
                path: 'emailVerification',
                name: 'emailVerification-link',
                component: () => import('@/views/auth/EmailVerification.vue'),
            },
            // 其他使用 EmptyLayout 的路由
        ],
    },
    // {
    //     path: '/order',
    //     children: [{
    //         path: 'orderDetail/:id',
    //         name: 'OrderDetail',
    //         component: UserOrderDetail,
    //         props: true
    //     },
    //     {
    //         path: 'userCheckOrder',
    //         component: UserCheckOrder,

    //     },
    //     {
    //         path: 'userRefundRequest',
    //         component: UserRefundRequest,

    //     },
    //     {
    //         path: 'userUnpaidOrder',
    //         component: UserUnpaidOrder,
    //     }

    //     ]
    // },
    // {
    //     path: '/provOrder',
    //     children: [
    //         {
    //             path: 'salesReport',
    //             component: ProviderSalesReport,
    //         },
    //         {
    //             path: 'providerCheckOrder',
    //             component: ProviderCheckOrder,
    //         },
    //         {
    //             path: 'providerActiveRefundOrder',
    //             component: ProviderActiveRefundOrder,
    //         }
    //     ]
    // }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;