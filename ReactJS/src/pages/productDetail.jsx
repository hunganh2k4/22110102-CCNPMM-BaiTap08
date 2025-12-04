import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Image, Typography, Divider, List, Avatar, Form, Input, Button, message, Spin } from "antd";
import { getProductDetailApi, getCommentsApi, postCommentApi, getCountsApi, getSimilarApi, getProductsByCategoryApi } from "../util/api";
import { AuthContext } from "../components/context/auth.context";

const { Title, Text } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [counts, setCounts] = useState({ buyersCount: 0, commentsCount: 0 });
    const [loading, setLoading] = useState(true);
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const p = await getProductDetailApi(id);
            setProduct(p?.data ?? p);

            const cm = await getCommentsApi(id);
            setComments(cm?.data ?? cm ?? []);

            const ct = await getCountsApi(id);
            setCounts(ct?.data ?? ct ?? { buyersCount: 0, commentsCount: 0 });
        } catch (err) {
            console.error("fetch product detail error", err);
            message.error("Không tải được chi tiết sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [id]);

    const onFinishComment = async (values) => {
        if (!auth?.isAuthenticated) {
            message.warning("Vui lòng đăng nhập để bình luận");
            navigate("/login");
            return;
        }
        setCommentSubmitting(true);
        try {
            await postCommentApi(id, values.content);
            message.success("Đã gửi bình luận");
            // reload comments & counts
            const cm = await getCommentsApi(id);
            setComments(cm?.data ?? cm ?? []);
            const ct = await getCountsApi(id);
            setCounts(ct?.data ?? ct ?? { buyersCount: 0, commentsCount: 0 });
        } catch (err) {
            console.error("post comment error", err);
            message.error("Gửi bình luận thất bại");
        } finally {
            setCommentSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: 80 }}><Spin /></div>;
    }

    if (!product) {
        return <div style={{ padding: 24 }}>Sản phẩm không tồn tại</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={[24,24]}>
                <Col xs={24} md={10}>
                    <Card>
                        <Image src={product.image} alt={product.name} style={{ maxHeight: 420, objectFit: "contain" }} />
                    </Card>
                </Col>
                <Col xs={24} md={14}>
                    <Title level={3}>{product.name}</Title>
                    <Text type="secondary">Danh mục: {product.category}</Text>
                    <Divider />
                    <Title level={4} style={{ color: "#ff4d4f" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</Title>
                    <Text>{product.description}</Text>
                    <Divider />
                    <Text>📦 Còn: {product.stock ?? 0} sản phẩm</Text>
                    <div style={{ marginTop: 12 }}>
                        <Text strong>{counts.buyersCount}</Text> người đã mua · <Text strong>{counts.commentsCount}</Text> người đã bình luận
                    </div>
                </Col>
            </Row>

            <Divider />

            {/* Similar products shown ABOVE comments; limit to 5 items in same category */}
            <Card title="Sản phẩm tương tự" style={{ marginBottom: 16 }}>
                <SimilarList productId={id} category={product.category} />
            </Card>

            <Card title="Bình luận">
                <List
                    dataSource={comments}
                    locale={{ emptyText: "Chưa có bình luận" }}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar>{(item.user?.name || item.user?.email || "U").charAt(0).toUpperCase()}</Avatar>}
                                title={item.user?.name || item.user?.email}
                                description={<div><div style={{ whiteSpace: "pre-wrap" }}>{item.content}</div><div style={{ marginTop: 6, fontSize: 12, color: "#888" }}>{new Date(item.createdAt).toLocaleString()}</div></div>}
                            />
                        </List.Item>
                    )}
                />

                <Divider />

                <Form onFinish={onFinishComment}>
                    <Form.Item name="content" rules={[{ required: true, message: "Vui lòng nhập bình luận" }]}>
                        <Input.TextArea rows={4} placeholder="Viết bình luận..." />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={commentSubmitting}>Gửi bình luận</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

// SimilarList: fetch 5 products from same category
const SimilarList = ({ productId, category }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            setLoading(true);
            try {
                // Dùng API lấy 5 sản phẩm cùng category
                const res = await getProductsByCategoryApi(category, 5);
                let data = res?.data ?? res;
                
                // Filter ra sản phẩm khác với productId hiện tại
                if (Array.isArray(data)) {
                    data = data.filter(it => String(it._id) !== String(productId)).slice(0, 5);
                } else {
                    data = [];
                }
                
                if (mounted) setItems(data);
            } catch (e) {
                console.error("fetch similar products error", e);
                if (mounted) setItems([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetch();
        return () => { mounted = false; };
    }, [productId, category]);

    if (loading) return <Spin />;

    return (
        <List
            dataSource={items}
            locale={{ emptyText: "Không có sản phẩm tương tự" }}
            renderItem={it => (
                <List.Item onClick={() => navigate(`/products/${it._id}`)} style={{ cursor: "pointer" }}>
                    <List.Item.Meta
                        avatar={<Avatar src={it.image} />}
                        title={it.name}
                        description={<Text type="secondary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(it.price)}</Text>}
                    />
                </List.Item>
            )}
        />
    );
};

export default ProductDetailPage;