const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 100,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            type: String,       
            required: false,
        }
    },
    { timestamps: true }
);


const Product = mongoose.model("product", productSchema);

module.exports = Product;
