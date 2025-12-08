const Product = require("../models/product");
const Fuse = require("fuse.js");

// Tạo sản phẩm
const createProductService = async (data) => {
    try {
        const exist = await Product.findOne({ name: data.name });
        if (exist) {
            return {
                EC: 1,
                EM: "Sản phẩm đã tồn tại!"
            }
        }

        const result = await Product.create(data);

        return {
            EC: 0,
            EM: "Tạo sản phẩm thành công",
            data: result
        };

    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};

// Lấy danh sách sản phẩm (filter + fuzzy search + sort + pagination)
const getProductsService = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        // -------- FILTER --------
        let filterQuery = {};

        if (query.category) {
            filterQuery.category = query.category;
            console.log("filterQuery.category:", filterQuery.category);
        }

        if (query.minPrice || query.maxPrice) {
            filterQuery.price = {};
            if (query.minPrice) filterQuery.price.$gte = Number(query.minPrice);
            if (query.maxPrice) filterQuery.price.$lte = Number(query.maxPrice);
        }

        if (query.minStock) {
            filterQuery.stock = { $gte: Number(query.minStock) };
        }

        // Lấy danh sách sản phẩm theo filter MongoDB
        let products = await Product.find(filterQuery).lean();


        // -------- FUZZY SEARCH --------
        if (query.keyword) {
            const keyword = query.keyword.trim();

            const fuse = new Fuse(products, {
                keys: ["name", "description", "category"],
                threshold: 0.3
            });

            products = fuse.search(keyword).map(res => res.item);
        }


        // -------- SORT --------
        if (query.sort) {
            switch(query.sort) {
                case 'price_asc':
                    products.sort((a, b) => (a.price || 0) - (b.price || 0));
                    break;
                case 'price_desc':
                    products.sort((a, b) => (b.price || 0) - (a.price || 0));
                    break;
                case 'name':
                    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    break;
                case 'newest':
                default:
                    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                    break;
            }
        } else {
            // Default sort by newest
            products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }


        // -------- PAGINATION --------
        const total = products.length;
        const paginated = products.slice(skip, skip + limit);

        return {
            EC: 0,
            data: paginated,
            pagination: {
                currentPage: page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit)
            }
        };

    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};

// Lấy sản phẩm theo ID
const getProductByIdService = async (id) => {
    try {
        const result = await Product.findById(id);
        if (!result) {
            return {
                EC: 1,
                EM: "Không tìm thấy sản phẩm"
            };
        }

        return { EC: 0, data: result };

    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};


// Cập nhật sản phẩm
const updateProductService = async (id, data) => {
    try {
        const updated = await Product.findByIdAndUpdate(id, data, { new: true });
        if (!updated) {
            return {
                EC: 1,
                EM: "Không tìm thấy sản phẩm để cập nhật"
            };
        }

        return {
            EC: 0,
            EM: "Cập nhật thành công",
            data: updated
        };

    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};


// Xóa sản phẩm
const deleteProductService = async (id) => {
    try {
        const result = await Product.findByIdAndDelete(id);
        if (!result) {
            return {
                EC: 1,
                EM: "Không tìm thấy sản phẩm để xóa"
            };
        }

        return {
            EC: 0,
            EM: "Xóa sản phẩm thành công"
        }

    } catch (error) {
        console.log(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};

// Lấy sản phẩm theo danh mục (max 5 sản phẩm)
const getProductsByCategoryService = async (category, limit = 5) => {
    try {
        if (!category) {
            return { EC: 1, EM: "Category is required" };
        }

        const products = await Product.find({ category })
            .limit(Number(limit))
            .lean();

        return {
            EC: 0,
            data: products
        };

    } catch (error) {
        console.error(error);
        return { EC: -1, EM: "Lỗi hệ thống" };
    }
};

module.exports = {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService,
    getProductsByCategoryService,
};
