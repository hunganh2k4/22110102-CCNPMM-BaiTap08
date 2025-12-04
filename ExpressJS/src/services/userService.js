require("dotenv").config();
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const createUserService = async (name, email, password) => {
    try {
        //check user exist
        const user = await User.findOne({ email });
        if (user) {
            console.log(`>>> user exist, chon 1 email khác: ${email}`);
            return null;
        }

        //hash user password
        const hashPassword = await bcrypt.hash(password, saltRounds)
        //save user to database
        let result = await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: "User"
        })
        return result;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

const loginService = async (email1, password) => {
    try {
        //fetch user by email
        const user = await User.findOne({ email: email1 });

        if (user) {
            //compare password
            const isMatchPassword = await bcrypt.compare(password, user.password);
            if (!isMatchPassword) {
                return {
                    EC: 2,
                    EM: "Email/Password không hop lệ"
                }
            } else {
                //create an access token
                const payload = {
                    id: user._id, 
                    email: user.email,
                    name: user.name,
                    role: user.role
                }

                const access_token = jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    {
                        expiresIn: process.env.JWT_EXPIRE
                    }
                )
                return {
                    EC: 0,
                    access_token,
                    user: {
                        id: user._id, 
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                };
            }
        } else {
            return {
                EC: 1,
                EM: "Email/Password không hop lệ"
            }
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

const getUserService = async () => {
    try {
        let result = await User.find({}).select("-password");
        return result;
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

const forgotPasswordService = async (email, newPassword) => {
    try {
        // Tìm user theo email
        const user = await User.findOne({ email });

        if (!user) {
            return {
                EC: 1,
                EM: "Email không tồn tại trong hệ thống"
            };
        }

        // Hash lại mật khẩu mới
        const hashPassword = await bcrypt.hash(newPassword, saltRounds);

        // Cập nhật mật khẩu trong database
        user.password = hashPassword;
        await user.save();

        return {
            EC: 0,
            EM: "Đặt lại mật khẩu thành công!"
        };
    } catch (error) {
        console.log(error);
        return {
            EC: -1,
            EM: "Lỗi hệ thống, vui lòng thử lại sau"
        };
    }
};

module.exports = {
    createUserService, 
    loginService, 
    getUserService,
    forgotPasswordService
}

