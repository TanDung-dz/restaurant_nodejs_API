const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const nhaHangRoutes = require('./routes/nhaHang');
const loaiMonAnRoutes = require('./routes/loaiMonAn');
const monAnRoutes = require('./routes/monAn');
const thongTinDatBanRoutes = require('./routes/thongTinDatBan');
const danhGiaRoutes = require('./routes/danhGia');
const thongBaoRoutes = require('./routes/thongBao');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nhahang', nhaHangRoutes);
app.use('/api/loaimonan', loaiMonAnRoutes);
app.use('/api/monan', monAnRoutes);
app.use('/api/datban', thongTinDatBanRoutes);
app.use('/api/danhgia', danhGiaRoutes);
app.use('/api/thongbao', thongBaoRoutes);
// Home route
app.get('/', (req, res) => {
  res.send('Restaurant API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});