import React, { useEffect, useState, useCallback } from 'react';
import {
    List,
    Card,
    Spin,
    Empty,
    Pagination,
    Input,
    Select,
    Row,
    Col,
    Button,
    Tag,
    Slider,
    Space,
    Divider,
    Typography,
    Modal, 
    Checkbox, 
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    StarFilled,
    ShoppingCartOutlined,
    EyeOutlined,
    StarOutlined
} from '@ant-design/icons';
import { getProductsApi, toggleFavoriteApi, getUserFavoritesApi } from '../util/api';
import { 
    fetchCartService, 
    addToCartService, 
    updateCartItemService, 
    removeFromCartService, 
    toggleSelectItemsService, 
    checkoutService,
    formatPrice 
} from '../util/cartService';
import { CartList, Button as LibButton, Modal as LibModal } from 'anhphan-cart-library';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Text } = Typography;

// Categories and sort options used by the UI (were missing)
const categories = [
    { value: "Điện thoại", label: "📱 Điện thoại", color: "blue" },
    { value: "Laptop", label: "💻 Laptop", color: "green" },
    { value: "Tablet", label: "📟 Tablet", color: "orange" },
    { value: "Đồng hồ", label: "⌚ Đồng hồ", color: "purple" }
];

const sortOptions = [
    { value: "newest", label: "Mới nhất" },
    { value: "price_asc", label: "Giá: Thấp đến cao" },
    { value: "price_desc", label: "Giá: Cao đến thấp" },
    { value: "name", label: "Tên A-Z" }
];

const ProductsPage = () => {
    const navigate = useNavigate();

    // CART FROM SERVER
    const [cartItems, setCartItems] = useState([]);
    const fetchCart = useCallback(async () => {
        const enriched = await fetchCartService();
        setCartItems(enriched);
    }, []);

    useEffect(() => {
        // fetch cart on mount so UI shows server cart
        fetchCart();
    }, [fetchCart]);

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // ...existing state...
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [total, setTotal] = useState(0);

    // UI State
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState("");
    const [priceRange, setPriceRange] = useState([0, 100000000]);
    const [sortBy, setSortBy] = useState("newest");

    // Active Filters
    const [filters, setFilters] = useState({
        keyword: "",
        category: "",
        minPrice: "",
        maxPrice: ""
    });

    const [cartVisible, setCartVisible] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    // fetch user favorites on mount
    useEffect(() => {
        const fetchFav = async () => {
            try {
                const res = await getUserFavoritesApi();
                const list = res?.data ?? res;
                const ids = Array.isArray(list) ? list.map(p => p._id) : [];
                setFavoriteIds(new Set(ids));
            } catch (e) {
                console.error("fetch favorites error:", e);
            }
        };
        fetchFav();
    }, []);

    const handleViewCart = () => setCartVisible(true);
    const handleCloseCart = () => setCartVisible(false);

    const handleAddToCart = async (productId) => {
        const prev = [...cartItems];
        // optimistic update
        const existing = prev.find(i => i._id === productId);
        let optimistic;
        if (existing) {
            optimistic = prev.map(i => i._id === productId ? { ...i, quantity: (i.quantity || 0) + 1 } : i);
        } else {
            const prod = products.find(p => p._id === productId) || {};
            optimistic = [
                {
                    _id: productId,
                    quantity: 1,
                    selected: true,
                    name: prod?.name || "",
                    price: prod?.price ?? 0,
                    image: prod?.image || ""
                },
                ...prev
            ];
        }
        setCartItems(optimistic);

        try {
            const cartResp = await addToCartService(productId);
            if (cartResp) {
                alert("Đã thêm sản phẩm vào giỏ hàng");
                await fetchCart(); // sync with server
            } else {
                throw new Error("addToCart failed");
            }
        } catch (err) {
            console.error("addToCart error", err);
            setCartItems(prev); // rollback
            alert("Lỗi khi thêm giỏ hàng");
        }
    };

    // increment/decrement call updateCartItem mutation and refresh
    const handleIncrease = async (id) => {
        const item = cartItems.find(i => i._id === id);
        if (!item) return;
        const newQ = (item.quantity || 0) + 1;
        await updateCartItemService(id, newQ);
        await fetchCart();
    };
    const handleDecrease = async (id) => {
        const item = cartItems.find(i => i._id === id);
        if (!item) return;
        const newQ = Math.max(1, (item.quantity || 1) - 1);
        await updateCartItemService(id, newQ);
        await fetchCart();
    };
    const handleRemove = async (id) => {
        await removeFromCartService(id);
        await fetchCart();
    };
    const handleToggleSelect = async (id, checked) => {
        await toggleSelectItemsService([id], checked);
        await fetchCart();
    };
    const handleSelectAll = async (checked) => {
        const ids = cartItems.map(i => i._id);
        if (ids.length === 0) return;
        await toggleSelectItemsService(ids, checked);
        await fetchCart();
    };

    const selectedItems = cartItems.filter(i => i.selected);
    const totalSelectedValue = selectedItems.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 0), 0);
    const handleProceedCheckout = async () => {
        const prev = [...cartItems];
        try {
            if (!selectedItems.length) {
                alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
                return;
            }
            const token = localStorage.getItem("access_token");
            if (!token) {
                alert("Vui lòng đăng nhập để thanh toán");
                navigate("/login");
                return;
            }

            // optimistic: remove selected from UI immediately
            const optimistic = cartItems.filter(i => !i.selected);
            setCartItems(optimistic);

            const items = selectedItems.map(i => ({ productId: i._id, name: i.name, price: i.price, quantity: i.quantity }));
            const result = await checkoutService(items);
            
            if (result && Number(result.EC) === 0) {
                alert(result.EM || "Thanh toán thành công");
                await fetchCart(); // ensure server sync
                setCartVisible(false);
            } else {
                // rollback if failed
                setCartItems(prev);
                alert(result?.EM || "Thanh toán không thành công");
            }
        } catch (err) {
            console.error("checkout error:", err);
            setCartItems(prev); // rollback
            alert("Lỗi khi thực hiện thanh toán");
        }
    };

    // Fetch Products
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pageSize,
                ...filters
            };

            const res = await getProductsApi(params);
            if (res?.EC === 0) {
                setProducts(res.data || []);
                setTotal(res.pagination?.totalItems || 0);
            }
        } catch (err) {
            console.error(err);
            setError("Không thể lấy dữ liệu sản phẩm");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handlers
    const handleSearch = () => {
        setFilters({
            keyword,
            category: "",
            minPrice: "",
            maxPrice: ""
        });
        setPage(1);
    };

    const handleFilter = () => {
        setFilters({
            keyword: "",
            category,
            minPrice: priceRange[0],
            maxPrice: priceRange[1]
        });
        setPage(1);
    };

    const handleReset = () => {
        setKeyword("");
        setCategory("");
        setPriceRange([0, 1000000000]);
        setSortBy("newest");
        setFilters({
            keyword: "",
            category: "",
            minPrice: "",
            maxPrice: ""
        });
        setPage(1);
    };

    const onPageChange = (p, size) => {
        setPage(p);
        setPageSize(size);
    };

    const getCategoryColor = (categoryValue) => {
        const cat = categories.find(c => c.value === categoryValue);
        return cat ? cat.color : "default";
    };

    // thêm handler chuyển tới trang chi tiết
    const handleViewDetail = (productId) => {
        navigate(`/products/${productId}`);
    }

    const handleToggleFavorite = async (productId) => {
        try {
            await toggleFavoriteApi(productId);
            
            // Refresh favorites from server to ensure sync
            const res = await getUserFavoritesApi();
            const list = res?.data ?? res;
            const ids = Array.isArray(list) ? list.map(p => p._id) : [];
            setFavoriteIds(new Set(ids));
        } catch (err) {
            console.error("toggle favorite error:", err);
            alert("Lỗi khi lưu sản phẩm yêu thích");
        }
    };

    return (
        <div style={{ 
            padding: '24px', 
            background: '#f8f9fa',
            minHeight: '100vh',
            position: 'relative' // Added for positioning the View Cart button
        }}>
            {/* View Cart Button (library) */}
            <LibButton
                onClick={async () => { await fetchCart(); handleViewCart(); }}
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 1000
                }}
            >
                View Cart ({cartItems.length})
            </LibButton>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <Title level={1} style={{ 
                    color: '#1890ff',
                    marginBottom: 8
                }}>
                    Khám Phá Sản Phẩm
                </Title>
                <Text type="secondary">
                    Tìm kiếm và khám phá những sản phẩm tuyệt vời
                </Text>
            </div>

            {/* Modern Filter Section */}
            <Card 
                style={{ 
                    marginBottom: 30,
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: 'none'
                }}
            >
                <Row gutter={[20, 20]} align="middle">
                    {/* Search */}
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="🔍 Tìm kiếm sản phẩm..."
                            allowClear
                            size="large"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onPressEnter={handleSearch}
                            style={{ borderRadius: 8 }}
                        />
                    </Col>

                    {/* Category Filter */}
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="🏷️ Tất cả danh mục"
                            size="large"
                            style={{ width: "100%" }}
                            value={category}
                            onChange={setCategory}
                            dropdownStyle={{ borderRadius: 8 }}
                        >
                            {categories.map(cat => (
                                <Option key={cat.value} value={cat.value}>
                                    <Tag color={cat.color}>{cat.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Price Range */}
                    <Col xs={24} md={6}>
                        <div style={{ padding: '0 8px' }}>
                            <Text strong>Khoảng giá: </Text>
                            <Text type="secondary">
                                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                            </Text>
                            <Slider
                                range
                                min={0}
                                max={100000000}
                                step={100000}
                                value={priceRange}
                                onChange={setPriceRange}
                                tooltip={{ formatter: formatPrice }}
                            />
                        </div>
                    </Col>

                    {/* Sort */}
                    <Col xs={24} md={4}>
                        <Select
                            placeholder="Sắp xếp"
                            size="large"
                            style={{ width: "100%" }}
                            value={sortBy}
                            onChange={setSortBy}
                        >
                            {sortOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    {/* Action Buttons */}
                    <Col xs={24} md={12}>
                        <Space wrap size="middle">
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                size="large"
                                onClick={handleSearch}
                                style={{ borderRadius: 8 }}
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<FilterOutlined />}
                                size="large"
                                onClick={handleFilter}
                                style={{ borderRadius: 8 }}
                            >
                                Lọc
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                size="large"
                                onClick={handleReset}
                                style={{ borderRadius: 8 }}
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </Col>

                    {/* Results Count */}
                    <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                        <Text type="secondary">
                            Tìm thấy <Text strong>{total}</Text> sản phẩm
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: "center", padding: 60 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">Đang tải sản phẩm...</Text>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && products.length === 0 ? (
                <Empty 
                    description="Không tìm thấy sản phẩm phù hợp"
                    imageStyle={{ height: 120 }}
                    style={{ margin: '60px 0' }}
                />
            ) : (
                <>
                    <List
                        grid={{
                            gutter: 24,
                            xs: 1,
                            sm: 2,
                            md: 3,
                            lg: 4,
                            xl: 4,
                            xxl: 4
                        }}
                        dataSource={products}
                        renderItem={item => (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={{
                                        borderRadius: 12,
                                        overflow: 'hidden',
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease',
                                        height: '100%'
                                    }}
                                    bodyStyle={{ padding: 16 }}
                                    cover={
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    height: 300,
                                                    width: "100%",
                                                    objectFit: "contain",
                                                    transition: 'transform 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            />
                                            <Tag 
                                                color={getCategoryColor(item.category)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    borderRadius: 6
                                                }}
                                            >
                                                {item.category}
                                            </Tag>
                                            {item.stock < 10 && (
                                                <Tag 
                                                    color="red"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 12,
                                                        right: 12,
                                                        borderRadius: 6
                                                    }}
                                                >
                                                    Sắp hết
                                                </Tag>
                                            )}
                                        </div>
                                    }
                                    actions={[
                                        <div
                                            key="view"
                                            onClick={() => handleViewDetail(item._id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "100%",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <EyeOutlined />
                                        </div>,

                                        <div
                                            key="cart"
                                            onClick={() => handleAddToCart(item._id)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "100%",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <ShoppingCartOutlined />
                                        </div>,

                                        <div
                                            key="favorite"
                                            onClick={() => handleToggleFavorite(item._id)}
                                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", cursor: "pointer" }}
                                        >
                                            {favoriteIds.has(item._id) ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                                        </div>
                                    ]}
                                >
                                    <div style={{ height: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <Title level={5} style={{ marginBottom: 8, lineHeight: 1.3 }}>
                                                {item.name}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {item.description?.length > 80 
                                                    ? `${item.description.substring(0, 80)}...` 
                                                    : item.description
                                                }
                                            </Text>
                                        </div>
                                        
                                        <div>
                                            <Divider style={{ margin: '12px 0' }} />
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                                                        {formatPrice(item.price)}
                                                    </Text>
                                                </Col>
                                                <Col>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        📦 {item.stock} sp
                                                    </Text>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />

                    {/* Pagination */}
                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={total}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) => 
                                `Hiển thị ${range[0]}-${range[1]} của ${total} sản phẩm`
                            }
                            onChange={onPageChange}
                            style={{ 
                                padding: '20px 0',
                                display: 'inline-block'
                            }}
                            size="default"
                        />
                    </div>
                </>
            )}

            {/* Insert Cart Modal (library UI) */}
            <LibModal open={cartVisible} onClose={handleCloseCart} title="Giỏ hàng của bạn">
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <strong>{cartItems.length}</strong> sản phẩm trong giỏ
                    </div>
                    <div>
                        <LibButton size="sm" style={{ marginRight: 8 }} onClick={() => handleSelectAll(true)}>Chọn tất cả</LibButton>
                        <LibButton size="sm" onClick={() => handleSelectAll(false)}>Bỏ chọn</LibButton>
                    </div>
                </div>

                {cartItems.length === 0 ? (
                    <Empty description="Giỏ hàng trống" />
                ) : (
                    <div style={{ marginBottom: 12 }}>
                        <CartList
                            items={cartItems}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            onDelete={handleRemove}
                            onToggleSelect={handleToggleSelect}
                        />
                    </div>
                )}

                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div>
                        <div>Tổng (đã chọn): <strong style={{ color: '#ff4d4f' }}>{formatPrice(totalSelectedValue)}</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <LibButton size="sm" onClick={handleCloseCart}>Đóng</LibButton>
                        <LibButton size="sm" variant="primary" onClick={handleProceedCheckout} disabled={selectedItems.length === 0}>
                            Thanh toán ({selectedItems.length})
                        </LibButton>
                    </div>
                </div>
            </LibModal>
        </div>
    );
};

export default ProductsPage;