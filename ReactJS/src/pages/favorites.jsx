import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Image, Typography, Empty, Spin, Button, Tag, Space, Divider } from "antd";
import { HeartFilled, ShoppingCartOutlined, EyeOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { getUserFavoritesApi, toggleFavoriteApi } from "../util/api";
import axios from "../util/axios.customize";

const { Title, Text } = Typography;

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await getUserFavoritesApi();
            const data = res?.data ?? res;
            setFavorites(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("fetch favorites error:", err);
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRemoveFavorite = async (productId) => {
        try {
            await toggleFavoriteApi(productId);
            setFavorites(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            console.error("remove favorite error:", err);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            const mutation = `
              mutation AddToCart($productId: ID!, $quantity: Int!) {
                addToCart(productId: $productId, quantity: $quantity) {
                  id userId items { productId quantity selected }
                }
              }
            `;
            const variables = { productId, quantity: 1 };
            const resp = await axios.post('/v1/graphql', { query: mutation, variables });
            const body = resp ?? {};
            const cartResp = body?.data?.addToCart ?? body?.addToCart ?? (body?.data?.cart ?? null);
            if (cartResp) {
                alert("Đã thêm sản phẩm vào giỏ hàng");
            } else {
                throw new Error("addToCart failed");
            }
        } catch (err) {
            console.error("addToCart error", err);
            alert("Lỗi khi thêm giỏ hàng");
        }
    };

    const handleViewDetail = (productId) => {
        navigate(`/products/${productId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: 80 }}><Spin /></div>;
    }

    if (favorites.length === 0) {
        return (
            <div style={{ padding: 24, minHeight: '100vh' }}>
                <Title level={2}>❤️ Sản phẩm yêu thích</Title>
                <Empty 
                    description="Bạn chưa yêu thích sản phẩm nào"
                    style={{ marginTop: 60 }}
                >
                    <Button type="primary" onClick={() => navigate("/products")}>
                        Khám phá sản phẩm
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ marginBottom: 8 }}>❤️ Sản phẩm yêu thích ({favorites.length})</Title>
                    <Text type="secondary">Những sản phẩm bạn đã lưu lại</Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchFavorites}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            <Divider />

            <Row gutter={[24, 24]}>
                {favorites.map(product => (
                    <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
                        <Card
                            hoverable
                            style={{
                                borderRadius: 12,
                                overflow: 'hidden',
                                border: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                height: '100%',
                                transition: 'all 0.3s ease'
                            }}
                            bodyStyle={{ padding: 16 }}
                            cover={
                                <div style={{ position: 'relative', height: 250, background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            objectFit: 'contain'
                                        }}
                                        preview={false}
                                    />
                                    <Tag
                                        color="red"
                                        style={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            borderRadius: 6
                                        }}
                                    >
                                        <HeartFilled /> Yêu thích
                                    </Tag>
                                </div>
                            }
                        >
                            <Title level={5} style={{ marginBottom: 8, minHeight: 50 }}>
                                {product.name}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                📦 Danh mục: {product.category}
                            </Text>
                            <Divider style={{ margin: '12px 0' }} />
                            <Title level={4} style={{ color: '#ff4d4f', marginBottom: 12 }}>
                                {formatPrice(product.price)}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Còn: {product.stock ?? 0} sản phẩm
                            </Text>
                            <Divider style={{ margin: '12px 0' }} />
                            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewDetail(product._id)}
                                >
                                    Xem
                                </Button>
                                <Button
                                    size="small"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => handleAddToCart(product._id)}
                                >
                                    Giỏ
                                </Button>
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveFavorite(product._id)}
                                >
                                    Xóa
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default FavoritesPage;
