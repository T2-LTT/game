# HƯỚNG DẪN ĐƯA GAME LÊN MẠNG (PUBLISH) VỚI NETLIFY

Đây là hướng dẫn chi tiết từng bước để bạn có thể tự mình cập nhật game lên mạng cho các bé chơi trên mọi thiết bị (Điện thoại, iPad, Máy tính) mà không tốn một đồng chi phí nào.

---

## 🔄 CÁCH CẬP NHẬT WEB KHI ĐÃ CÓ LINK (Dễ nhất - Không đổi link)

Nếu bạn đã đăng ký trang web (ví dụ: `https://tanthiluong.netlify.app`) và vừa sửa code/thêm tính năng mới, hãy làm theo 3 bước đơn giản này để cập nhật:

1. **Bước 1 (Đóng gói):** Click đúp chuột vào file **`build_game.bat`** ở thư mục `d:\Project_Game`. Đợi 3 giây, thư mục **`dist`** mới nhất sẽ tự động bật ra.
2. **Bước 2 (Mở trang quản lý):** Truy cập [https://app.netlify.com/](https://app.netlify.com/) và đăng nhập tài khoản của bạn.
3. **Bước 3 (Cập nhật):** 
   - Bấm vào tên trang web của bạn (`tanthiluong.netlify.app`).
   - Vào mục **Deploys** (ở menu bên trái hoặc phía trên).
   - Cuộn xuống **cuối trang Deploys**, bạn sẽ thấy ô nét đứt ghi:  
     > *"Need to update your site? Drag and drop your site output folder here"*
   - **Kéo và thả thư mục `dist`** vào khung ô nét đứt đó.

🎉 **XONG!** Sau 3-5 giây, trang web `tanthiluong.netlify.app` của bạn sẽ được cập nhật phiên bản mới nhất mà địa chỉ link vẫn giữ nguyên 100%!

---

## 🆕 CÁCH TẠO TRANG WEB MỚI TỪ ĐẦU (Dành cho lần đầu tiên)

### Bước 1: Đóng gói Game (Tạo thư mục dist)
1. Mở thư mục chứa code game: `d:\Project_Game`
2. Tìm và click đúp chuột vào file **`build_game.bat`**.
3. Thư mục **`dist`** sẽ tự động mở lên.

### Bước 2: Tải lên Netlify lần đầu
1. Mở trình duyệt web và truy cập vào: [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Kéo và thả thư mục **`dist`** vào ô trống giữa màn hình.
3. Netlify sẽ tự động tạo một link tạm thời.

### Bước 3: Đổi tên miền & Giữ vĩnh viễn (Claim site)
1. Bấm nút **"Claim this site"** ➔ Đăng nhập bằng tài khoản **Google / Gmail**.
2. Đổi tên link thành tên đẹp (ví dụ `tanthiluong.netlify.app`):
   - Vào **Site configuration** ➔ Tìm nút **Change site name**.
   - Nhập tên muốn đặt ➔ Bấm **Save**.

---
**🎉 CHÚC MỪNG BẠN ĐÃ TRỞ THÀNH MỘT NHÀ PHÁT TRIỂN GAME ĐÍCH THỰC!**
