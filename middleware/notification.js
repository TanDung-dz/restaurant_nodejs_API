const ThongBao = require('../models/thongBao');
const NhaHang = require('../models/nhaHang');

/**
 * Tạo thông báo mới
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} data - Dữ liệu thông báo
 * @returns {Object} - Thông báo đã tạo
 */
exports.createNotification = async (userId, data) => {
  try {
    // Tạo thông báo mới
    const thongBao = await ThongBao.create({
      userId,
      ten: data.ten,
      moTa: data.moTa,
      noiDung: data.noiDung,
      theLoai: data.theLoai || 'Thông báo chung'
    });
    
    return thongBao;
  } catch (error) {
    console.error('Lỗi khi tạo thông báo:', error);
    return null;
  }
};

/**
 * Tạo thông báo khi đặt bàn thành công
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} datBanData - Dữ liệu đơn đặt bàn
 */
exports.datBanNotification = async (userId, datBanData) => {
  try {
    // Lấy thông tin nhà hàng nếu chỉ có ID
    let nhaHangName = datBanData.nhaHangName;
    if (!nhaHangName && datBanData.nhaHangId) {
      const nhaHang = await NhaHang.findById(datBanData.nhaHangId);
      nhaHangName = nhaHang ? nhaHang.tenNhaHang : 'nhà hàng';
    }

    const data = {
      ten: 'Đặt bàn thành công',
      moTa: `Bạn đã đặt bàn thành công tại ${nhaHangName}`,
      noiDung: `Cảm ơn bạn đã đặt bàn tại ${nhaHangName} vào lúc ${new Date(datBanData.thoiGianDatBan).toLocaleString('vi-VN')}. Mã đơn đặt bàn của bạn là ${datBanData._id}. Vui lòng đến đúng giờ. Xin cảm ơn!`,
      theLoai: 'Đặt bàn'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo đặt bàn:', error);
    return null;
  }
};

/**
 * Tạo thông báo khi xác nhận đơn đặt bàn
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} datBanData - Dữ liệu đơn đặt bàn
 */
exports.xacNhanDatBanNotification = async (userId, datBanData) => {
  try {
    // Lấy thông tin nhà hàng nếu chỉ có ID
    let nhaHangName = datBanData.nhaHangName;
    if (!nhaHangName && datBanData.nhaHangId) {
      const nhaHang = await NhaHang.findById(datBanData.nhaHangId);
      nhaHangName = nhaHang ? nhaHang.tenNhaHang : 'nhà hàng';
    }

    const data = {
      ten: 'Đơn đặt bàn đã được xác nhận',
      moTa: `Đơn đặt bàn của bạn tại ${nhaHangName} đã được xác nhận`,
      noiDung: `Đơn đặt bàn của bạn tại ${nhaHangName} vào lúc ${new Date(datBanData.thoiGianDatBan).toLocaleString('vi-VN')} đã được xác nhận. Vui lòng đến đúng giờ. Xin cảm ơn!`,
      theLoai: 'Đặt bàn'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo xác nhận đặt bàn:', error);
    return null;
  }
};

/**
 * Tạo thông báo khi hủy đơn đặt bàn
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} datBanData - Dữ liệu đơn đặt bàn
 * @param {Boolean} byCustmer - Đơn bị hủy bởi khách hàng?
 */
exports.huyDatBanNotification = async (userId, datBanData, byCustomer = true) => {
  try {
    // Lấy thông tin nhà hàng nếu chỉ có ID
    let nhaHangName = datBanData.nhaHangName;
    if (!nhaHangName && datBanData.nhaHangId) {
      const nhaHang = await NhaHang.findById(datBanData.nhaHangId);
      nhaHangName = nhaHang ? nhaHang.tenNhaHang : 'nhà hàng';
    }

    const title = byCustomer ? 'Bạn đã hủy đơn đặt bàn' : 'Đơn đặt bàn đã bị hủy';
    const content = byCustomer 
      ? `Bạn đã hủy đơn đặt bàn tại ${nhaHangName} vào lúc ${new Date(datBanData.thoiGianDatBan).toLocaleString('vi-VN')}. Mong bạn sẽ quay lại đặt bàn lần sau.`
      : `Nhà hàng ${nhaHangName} đã hủy đơn đặt bàn của bạn vào lúc ${new Date(datBanData.thoiGianDatBan).toLocaleString('vi-VN')} do một số vấn đề. Xin vui lòng liên hệ nhà hàng hoặc đặt bàn lại. Chúng tôi xin lỗi vì sự bất tiện này.`;

    const data = {
      ten: title,
      moTa: `Đơn đặt bàn tại ${nhaHangName} đã bị hủy`,
      noiDung: content,
      theLoai: 'Đặt bàn'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo hủy đặt bàn:', error);
    return null;
  }
};

/**
 * Tạo thông báo khi thanh toán thành công
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} thanhToanData - Dữ liệu thanh toán
 */
exports.thanhToanNotification = async (userId, thanhToanData) => {
  try {
    // Lấy thông tin nhà hàng nếu chỉ có ID
    let nhaHangName = thanhToanData.nhaHangName || 'nhà hàng';
    const amount = thanhToanData.soLuong.toLocaleString('vi-VN') + ' đồng';

    const data = {
      ten: 'Thanh toán thành công',
      moTa: `Đơn đặt bàn của bạn đã được thanh toán ${amount}`,
      noiDung: `Đơn đặt bàn của bạn tại ${nhaHangName} đã được thanh toán thành công với số tiền ${amount}. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`,
      theLoai: 'Thanh toán'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo thanh toán:', error);
    return null;
  }
};

/**
 * Tạo thông báo khi có đánh giá mới
 * @param {String} userId - ID người dùng nhận thông báo (chủ nhà hàng)
 * @param {Object} danhGiaData - Dữ liệu đánh giá
 */
exports.danhGiaNotification = async (userId, danhGiaData) => {
  try {
    // Mức độ đánh giá bằng sao
    const starRating = '★'.repeat(danhGiaData.xepHang) + '☆'.repeat(5 - danhGiaData.xepHang);
    
    const data = {
      ten: 'Đánh giá mới',
      moTa: `Có đánh giá mới (${danhGiaData.xepHang} sao) cho nhà hàng`,
      noiDung: `Nhà hàng của bạn vừa nhận được đánh giá ${starRating} từ khách hàng. ${danhGiaData.binhLuan ? `Nội dung: "${danhGiaData.binhLuan}"` : ''}`,
      theLoai: 'Đánh giá'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo đánh giá:', error);
    return null;
  }
};

/**
 * Tạo thông báo phản hồi đánh giá
 * @param {String} userId - ID người dùng nhận thông báo (người đánh giá)
 * @param {Object} danhGiaData - Dữ liệu phản hồi đánh giá
 */
exports.phanHoiDanhGiaNotification = async (userId, danhGiaData) => {
  try {
    const data = {
      ten: 'Phản hồi đánh giá',
      moTa: `Nhà hàng đã phản hồi đánh giá của bạn`,
      noiDung: `Nhà hàng đã phản hồi đánh giá của bạn: "${danhGiaData.traLoi}"`,
      theLoai: 'Đánh giá'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo phản hồi đánh giá:', error);
    return null;
  }
};

/**
 * Tạo thông báo khuyến mãi
 * @param {String} userId - ID người dùng nhận thông báo
 * @param {Object} khuyenMaiData - Dữ liệu khuyến mãi
 */
exports.khuyenMaiNotification = async (userId, khuyenMaiData) => {
  try {
    const data = {
      ten: khuyenMaiData.ten || 'Thông báo khuyến mãi',
      moTa: khuyenMaiData.moTa || 'Có khuyến mãi mới dành cho bạn',
      noiDung: khuyenMaiData.noiDung || 'Khuyến mãi mới từ hệ thống nhà hàng',
      theLoai: 'Khuyến mãi'
    };
    
    return await this.createNotification(userId, data);
  } catch (error) {
    console.error('Lỗi khi tạo thông báo khuyến mãi:', error);
    return null;
  }
};

/**
 * Tạo thông báo cho nhiều người dùng cùng lúc
 * @param {Array} userIds - Danh sách ID người dùng
 * @param {Object} data - Dữ liệu thông báo
 */
exports.createMultipleNotifications = async (userIds, data) => {
  try {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await this.createNotification(userId, data);
      if (notification) {
        notifications.push(notification);
      }
    }
    return notifications;
  } catch (error) {
    console.error('Lỗi khi tạo nhiều thông báo:', error);
    return [];
  }
};