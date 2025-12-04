import React, { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined, ShoppingOutlined, HeartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    console.log(">> check auth: ", auth);

    const [current, setCurrent] = useState('home');

    const items = [
        {
            label: <Link to="/">Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />
        },
        ...(auth.isAuthenticated ? [{
            label: <Link to="/products">Products</Link>,
            key: 'products',
            icon: <ShoppingOutlined />
        }] : []),
        ...(auth.isAuthenticated ? [{
            label: <Link to="/favorites">Yêu thích</Link>,
            key: 'favorites',
            icon: <HeartOutlined />
        }] : []),
        ...(auth.isAuthenticated ? [{
            label: <Link to="/purchases">Đơn hàng</Link>,
            key: 'purchases',
            icon: <UnorderedListOutlined />
        }] : []),
        ...(auth.isAuthenticated ? [{
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />
        }] : []),
        {
            label: `Welcome ${auth?.user?.email ?? ""}`,
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [{
                    label: <span onClick={() => {
                        localStorage.removeItem("access_token");
                        setCurrent("home");
                        setAuth({
                            isAuthenticated: false,
                            user: {
                                email: "",
                                name: "",
                            }
                        });
                        navigate("/");
                    }}>Đăng xuất</span>,
                    key: 'logout',
                }] : [{
                    label: <Link to="/login">Đăng nhập</Link>,
                    key: 'login',
                }])
            ]
        }
    ];

    const onClick = (e) => {
        console.log('click ', e);
        setCurrent(e.key);
    };

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;