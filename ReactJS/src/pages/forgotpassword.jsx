import React from 'react';
import { Button, Col, Divider, Form, Input, Row } from 'antd';
import { forgotPasswordApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { email, newPassword } = values;

        const res = await forgotPasswordApi(email, newPassword);

        if (res && res.EC === 0) {
            alert(res.EM || "Đặt lại mật khẩu thành công!");
            navigate("/login");
        } else {
            alert(res?.EM || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    return (
        <Row justify="center" style={{ marginTop: "30px" }}>
            <Col xs={24} md={16} lg={8}>
                <fieldset style={{
                    padding: "15px",
                    margin: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px"
                }}>
                    <legend>Quên Mật Khẩu</legend>
                    <Form
                        name="forgot-password"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{
                                required: true,
                                message: 'Vui lòng nhập email!',
                            }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới!',
                            }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                    <Link to={"/"}><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Đã có tài khoản? <Link to={"/login"}>Đăng nhập</Link>
                    </div>
                </fieldset>
            </Col>
        </Row>
    );
};

export default ForgotPasswordPage;
