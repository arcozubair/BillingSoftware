const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const AppError = require("./utils/appError")
const connectDB = require("./database")
const userRouter = require("./routes/user.routes")
const customerRouter = require("./routes/customer.routes")
const globalErrorHandler = require("./controllers/error.controller");
const cors = require("cors")
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
require("./controllers/seeding")
const vendorRoutes = require('./routes/vendor.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const watakRoutes = require('./routes/watak.routes');



const app = express();
app.use(express.json())
app.use(mongoSanitize());
app.use(cors());
app.use(helmet());
connectDB();

// Middlewares
app.use(express.json());
app.use("/api/v1/", userRouter);
app.use("/api/v1/", customerRouter);
app.use('/api/v1/', vendorRoutes);
app.use('/api/v1', inventoryRoutes);
app.use('/api/v1', watakRoutes);


app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is listening on port ${port}...`);
});
