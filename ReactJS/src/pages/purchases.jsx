import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Card, Typography, Empty, Spin, Button, Space, Divider, Badge, Tag } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "../util/axios.customize";

const { Title, Text } = Typography;

const PurchasesPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch all orders (you may need to create a specific endpoint for user orders)
            const query = `
                query {
                    userOrders {
                        id
                        userId
                        items { productId name price quantity }
                        total
                        status
                        createdAt
                        updatedAt
                    }
                }
            `;
            const res = await axios.post('/v1/graphql', { query });
            const body = res ?? {};
            const data = body?.data?.userOrders ?? body?.userOrders ?? [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("fetch orders error:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getStatusColor = (status) => {
        const colors = {
            'PAID': 'green',
            'PENDING': 'orange',
            'CANCELLED': 'red'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text copyable>{id?.substring(0, 8) || 'N/A'}...</Text>,
            width: 120
        },
        {
            title: 'Số lượng',
            dataIndex: 'items',
            key: 'items',
            render: (items) => {
                const total = Array.isArray(items) ? items.reduce((s, i) => s + (i.quantity || 0), 0) : 0;
                return <Badge count={total} style={{ backgroundColor: '#52c41a' }} />;
            },
            width: 80
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => <Text strong style={{ color: '#ff4d4f' }}>{formatPrice(total)}</Text>,
            width: 150
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status || 'N/A'}</Tag>,
            width: 100
        },
        {
            title: 'Ngày mua',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
            width: 120
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewOrder(record)}
                >
                    Xem
                </Button>
            ),
            width: 100
        }
    ];

    const handleViewOrder = (order) => {
        // Show order details
        alert(`Đơn hàng: ${order.id}\nTổng: ${formatPrice(order.total)}\nSố sản phẩm: ${order.items?.length || 0}`);
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: 80 }}><Spin /></div>;
    }

    if (orders.length === 0) {
        return (
            <div style={{ padding: 24, minHeight: '100vh' }}>
                <Title level={2}>🛍️ Đơn hàng của bạn</Title>
                <Empty 
                    description="Bạn chưa có đơn hàng nào"
                    style={{ marginTop: 60 }}
                >
                    <Button type="primary" onClick={() => navigate("/products")}>
                        Mua sắm ngay
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ marginBottom: 8 }}>🛍️ Đơn hàng của bạn</Title>
                    <Text type="secondary">Tổng {orders.length} đơn hàng</Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchOrders}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Table
                    columns={columns}
                    dataSource={orders.map(o => ({ ...o, key: o.id }))}
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} đơn` }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};

export default PurchasesPage;
