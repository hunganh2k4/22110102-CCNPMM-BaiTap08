require('dotenv').config();
//import các nguồn cần dùng
const express = require('express'); //commonjs
const configViewEngine = require('./config/viewEngine');
const apiRoutes = require('./routes/api');
const connection = require('./config/database');
const { getHomepage } = require('./controllers/homeController');
const productRoutes = require("./routes/productRoutes");
const cors = require('cors');


const app = express(); //cấu hình app là express
//cấu hình port, nếu tìm thấy port trong env, không thì trả về 8888
const port = process.env.PORT || 8888;

app.use(cors());//config cons
app.use(express.json()) //config req.body cho json
app.use(express.urlencoded({ extended: true })) // for form data

configViewEngine(app);//config template engine

//config route cho view ejs
const webAPI = express.Router();
webAPI.get("/", getHomepage);
app.use('/', webAPI);

//khai báo route cho API
app.use('/v1/api/', apiRoutes);
app.use("/v1/api/products", productRoutes);

// add import for auth and graphql init
const auth = require("./middleware/auth");
const initGraphql = require("./graphql");

// initialize DB and GraphQL then start server
(async () => {
    try {
        //kết nối database using mongoose
        await connection();

        // initialize GraphQL (mounts /v1/graphql and uses auth middleware)
        await initGraphql(app, auth);

        //lắng nghe port trong env
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`);
        })
    } catch (error) {
        console.log(">>> Error connect to DB: ", error)
    }
})()