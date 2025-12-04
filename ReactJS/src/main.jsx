import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css';

import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/forgotpassword.jsx';
import ProductsPage from './pages/products.jsx';
import ProductDetailPage from './pages/productDetail.jsx';
import FavoritesPage from './pages/favorites.jsx';
import PurchasesPage from './pages/purchases.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "products",
                element: <ProductsPage />
            },
            {
                path: "products/:id", // thêm route chi tiết sản phẩm
                element: <ProductDetailPage />
            },
            {
                path: "favorites",
                element: <FavoritesPage />
            },
            {
                path: "purchases",
                element: <PurchasesPage />
            },
            {
                path: "user",
                element: <UserPage />
            },
            {
                path: "register",
                element: <RegisterPage />
            },
            {
                path: "login",
                element: <LoginPage />
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />
            },
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthWrapper>
            <RouterProvider router={router} />
        </AuthWrapper>
    </React.StrictMode>
)