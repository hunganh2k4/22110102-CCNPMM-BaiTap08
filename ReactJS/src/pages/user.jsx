import { notification, Table } from "antd";
import { useEffect, useState } from "react";
import { getUserApi } from "../util/api";

const UserPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await getUserApi();
                console.log("API Response:", res); // Debug log
                
                // Kiểm tra nếu res là mảng thì set, nếu không set mảng rỗng
                if (Array.isArray(res)) {
                    setDataSource(res);
                } else if (res?.data && Array.isArray(res.data)) {
                    setDataSource(res.data);
                } else {
                    setDataSource([]);
                    if (res?.message) {
                        notification.error({
                            message: "Unauthorized",
                            description: res.message
                        });
                    }
                }
            } catch (error) {
                console.error("Fetch user error:", error);
                setDataSource([]);
                notification.error({
                    message: "Error",
                    description: "Failed to fetch users"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const columns = [
        {
            title: 'Id',
            dataIndex: '_id',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Name',
            dataIndex: 'name',
        },
        {
            title: 'Role',
            dataIndex: 'role',
        }
    ];

    return (
        <div style={{ padding: 30 }}>
            <Table
                bordered
                dataSource={dataSource}
                columns={columns}
                rowKey={"_id"}
                loading={loading}
            />
        </div>
    );
}

export default UserPage;