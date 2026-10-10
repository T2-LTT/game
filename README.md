# 🚀 Hành Trình Vũ Trụ (Cosmic Journey)

**Hành Trình Vũ Trụ** là một ứng dụng giáo dục tương tác vui nhộn dành cho trẻ em, được thiết kế đặc biệt để giúp các bé vừa học vừa chơi thông qua các mini-game hấp dẫn với chủ đề không gian vũ trụ.

Giao diện ứng dụng sử dụng phong cách **Glassmorphism** (kính mờ) hiện đại, kết hợp với các dải màu neon rực rỡ (hồng, xanh dương, vàng) cùng hiệu ứng pháo giấy (confetti) và âm thanh sống động để kích thích sự hứng thú của trẻ.

---

## 👩‍🚀 Các Phi Hành Gia (Hồ Sơ Người Chơi)

Ứng dụng hỗ trợ đa hồ sơ, được thiết kế riêng biệt để phù hợp với độ tuổi và năng lực của từng bé:

1. **Bé Bông (2 Tuổi) - Tân Binh:** Làm quen với thế giới xung quanh qua âm thanh, màu sắc và hình ảnh động vật dễ thương.
2. **Tuấn Kiệt (3 Tuổi) - Tân Binh:** Học nhận biết Bảng chữ cái tiếng Việt, Số đếm cơ bản, Màu sắc và Con vật qua giọng đọc chuẩn.
3. **Bảo Nhi (8 Tuổi) - Chỉ Huy:** Thử thách trí tuệ với các bài Toán học (cộng, trừ, nhân, chia) và kho Từ vựng Tiếng Anh khổng lồ (hơn 500 từ vựng theo chuẩn Cambridge).

---

## 🎮 Các Trò Chơi Nổi Bật

- **Tìm Điểm Khác Biệt (Spot the Difference):** Rèn luyện sự tinh mắt với hơn 50 màn chơi sinh động, bối cảnh vũ trụ đa dạng (phi thuyền, rô-bốt, người ngoài hành tinh).
- **Lật Thẻ Trí Nhớ (Memory Game):** Rèn luyện trí nhớ với 2 cấp độ Dễ (Động vật) và Khó (Từ vựng vũ trụ Tiếng Anh).
- **Học Từ Vựng Tiếng Anh:** Hơn 500 từ vựng chia theo 59 chủ đề đa dạng (Gia đình, Động vật, Màu sắc, Cơ thể...). Tích hợp phát âm chuẩn (Text-to-Speech) và hệ thống trắc nghiệm.
- **Thử Thách Toán Học:** Các phép tính cộng, trừ, nhân, chia sinh ngẫu nhiên giúp bé rèn luyện tư duy logic.
- **Khám Phá Thế Giới (Màu sắc, Con vật, Số đếm, Chữ cái):** Bé nhấp vào các thẻ bài hình ảnh thực tế và đầy màu sắc để nghe tên gọi và tìm đáp án đúng.

---

## 📊 Báo Cáo Phụ Huynh (Parent Dashboard)

Ứng dụng tích hợp một hệ thống theo dõi ẩn dành riêng cho phụ huynh (Bảo mật bằng mật khẩu là ngày-tháng-năm hiện tại `DDMMYYYY`).
- **Thống Kê:** Theo dõi điểm số tổng, huy hiệu, số câu trả lời đúng/sai của từng bé.
- **Lịch Sử Sai Lầm:** Lưu trữ chi tiết câu hỏi bé làm sai, đáp án bé đã chọn và đáp án đúng, giúp bố mẹ biết bé đang yếu ở điểm nào để kèm cặp thêm.
- **Tủ Huy Hiệu:** Hệ thống thành tựu khích lệ tinh thần bé (Chuyên gia màu sắc, Thần đồng toán học...).

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend Framework:** React 18 + Vite
- **Styling:** CSS3 (Glassmorphism, CSS Variables, Keyframes Animation)
- **Icons:** `lucide-react`
- **Hiệu ứng:** `canvas-confetti`
- **Text-to-Speech:** Web Speech API (Hỗ trợ cả giọng Tiếng Việt và Tiếng Anh)
- **Lưu trữ dữ liệu:** LocalStorage & Kiến trúc JSON tĩnh (dễ dàng mở rộng từ vựng và câu hỏi mà không cần chạm vào logic code).

---

## 🚀 Cách Cài Đặt và Chạy Dự Án

1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

2. Chạy môi trường phát triển (Development):
   ```bash
   npm run dev
   ```

3. Đóng gói sản phẩm (Production) để đẩy lên Netlify hoặc Vercel:
   ```bash
   npm run build
   ```
   *Toàn bộ sản phẩm cuối cùng sẽ nằm gọn trong thư mục `dist`.*

---
*Dự án được xây dựng với tình yêu thương dành cho các bé, giúp các bé làm quen với công nghệ một cách an toàn và bổ ích! ❤️*
