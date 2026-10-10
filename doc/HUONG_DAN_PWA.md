# 📱 Hướng Dẫn Biến Website Thành "App Xịn" Trên Điện Thoại (PWA)

Game đã được tích hợp công nghệ **PWA (Progressive Web App)** giúp mở ứng dụng toàn màn hình (không có thanh địa chỉ trình duyệt), tải mượt mà và chạy mượt như App tải từ App Store / CH Play.

---

## 🔄 BƯỚC 1: Cập Nhật Bản Mới Lên Netlify (Giữ nguyên Link cũ)

Vì vừa bổ sung cấu hình App (PWA), bạn chỉ cần làm 3 bước cập nhật đơn giản này:

1. **Tạo bản đóng gói mới:** Click đúp vào file `build_game.bat` ở thư mục `d:\Project_Game`. Thư mục `dist` mới nhất sẽ tự động bật ra.
2. **Mở trang Netlify Deploys:** 
   - Vào [https://app.netlify.com/](https://app.netlify.com/) (đăng nhập tài khoản của bạn).
   - Chọn trang web `tanthiluong.netlify.app`.
   - Chọn mục **Deploys** ở menu.
3. **Kéo thả để cập nhật:** 
   - Cuộn xuống cuối trang Deploys, tìm khung nét đứt:  
     > *"Need to update your site? Drag and drop your site output folder here"*
   - **Kéo thả thư mục `dist`** vào khung nét đứt này.
   - Đợi 3 giây là trang web `https://tanthiluong.netlify.app` đã sẵn sàng phiên bản PWA!

---

## 📱 BƯỚC 2: Cài Đặt App Trên Điện Thoại Cho Bé

### 🍎 1. Trên Điện Thoại iPhone / iPad (Safari):
1. Mở trang web [https://tanthiluong.netlify.app](https://tanthiluong.netlify.app) bằng **trình duyệt Safari**.
2. Bấm nút **Chia sẻ** (biểu tượng hình ô vuông có mũi tên chỉ lên ở giữa phía dưới màn hình).
3. Cuộn xuống và chọn **"Thêm vào Màn hình chính"** (*Add to Home Screen*).
4. Đổi tên thành **"Game Bé Học"** ➔ Bấm **Thêm** (*Add*).
5. Màn hình chính điện thoại sẽ xuất hiện Icon Game 🚀 cực kỳ xinh xắn!

---

### 🤖 2. Trên Điện Thoại Android (Samsung, Oppo, Xiaomi, Google Pixel... - Chrome):
1. Mở trang web [https://tanthiluong.netlify.app](https://tanthiluong.netlify.app) bằng **trình duyệt Google Chrome**.
2. Thông thường Chrome sẽ hiện thông báo ở dưới cùng: **"Thêm Game Bé Học vào Màn hình chính"** ➔ Bấm **Cài đặt** (Install).
3. Nếu không thấy thông báo: Bấm vào **dấu 3 chấm ⋮** ở góc trên bên phải Chrome ➔ Chọn **"Thêm vào màn hình chính"** hoặc **"Cài đặt ứng dụng"**.
4. Xong! Game sẽ hiển thị như một Ứng dụng Android độc lập.

---

## ✨ Lợi ích khi dùng dạng App (PWA):
- 🚀 **Full Màn Hình:** Không còn thanh tìm kiếm URL hay nút bấm trình duyệt vướng mắt.
- ⚡ **Khởi động tức thì:** Mở cực nhanh từ icon ngoài màn hình điện thoại.
- 📱 **Trải nghiệm ứng dụng thật:** Có icon riêng ngoài màn hình chính.
