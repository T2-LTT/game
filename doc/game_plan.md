# 🚀 Kế hoạch Phát triển Game: Hành Trình Vũ Trụ

**Thông tin người chơi:**
- 👦 **Tân Binh:** Tuấn Kiệt (Sinh năm 2023 - 3 tuổi) - Avatar: `tuankiet.JPG`
- 👧 **Chỉ Huy:** Bảo Nhi (Sinh năm 2018 - 8 tuổi) - Avatar: `baonhi.JPG`
- 🌐 **Website Live:** [https://tanthiluong.netlify.app](https://tanthiluong.netlify.app)

Dưới đây là tiến độ thực hiện dự án chi tiết đã hoàn thành và định hướng mở rộng tương lai.

---

## 📅 Tiến độ Thực hiện (Checklist)

### 1. Giai đoạn Khởi tạo & Thiết kế Cơ sở (Foundation)
- [x] Chốt chủ đề game: **Hành Trình Vũ Trụ** (Space Adventure).
- [x] Lựa chọn Công nghệ: `React` + `Vite` + `CSS thuần` phong cách Glassmorphic Neon.
- [x] Khởi tạo dự án thành công (tại `d:\Project_Game`).
- [x] Tạo script `run_game.bat` (chạy game 1-click) và `build_game.bat` (đóng gói game 1-click).
- [x] Xây dựng UI Menu chính hiện đại với hiệu ứng Nền Ngân Hà (StarBackground) mượt 60fps.
- [x] Áp dụng logic tự động tính tuổi theo năm sinh (2023 và 2018).
- [x] Tích hợp Hình Đại Diện thực tế của 2 bé (`tuankiet.JPG` & `baonhi.JPG`) trên Menu & các màn chơi.

### 2. Giai đoạn Phát triển Trạm Tuấn Kiệt (Mầm non - 3 tuổi)
- [x] Minigame 1: **Nhận biết màu sắc** (Đỏ, Xanh, Vàng, Hồng, Tím, Cam).
- [x] Minigame 2: **Tìm con vật** với hình ảnh chụp thực tế sống động (Mèo, Chó, Chim, Cá, Thỏ, Voi,...).
- [x] Minigame 3: **Học đếm số** (0 đến 10) dành cho lứa tuổi mẫu giáo.
- [x] Minigame 4: **Học bảng chữ cái Tiếng Việt** (A, Ă, Â, B, C,...).
- [x] Minigame 5: **Lật Thẻ Trí Nhớ Vũ Trụ (Cấp Dễ)** - Ghép cặp hình ảnh 6 thẻ.
- [x] Tích hợp giọng phát âm Tiếng Việt chuẩn TTS (`window.speechSynthesis`).
- [x] Nút bấm to tròn (Big Touch Targets) phù hợp cho tay bé 3 tuổi dễ chạm.
- [x] Thêm hiệu ứng pháo hoa chúc mừng (Confetti) & âm thanh khen ngợi khi bé chọn đúng.

### 3. Giai đoạn Phát triển Trạm Bảo Nhi (Tiểu học - 8 tuổi)
- [x] Minigame 1: **Giải toán nạp nhiên liệu tên lửa** (Phép Cộng, Trừ, Nhân ngẫu nhiên).
- [x] Minigame 2: **Mật Mã Tiếng Anh Vũ Trụ (English Vocabulary & Word Spelling)** với 2 chế độ:
  - Mode 1: Chọn từ Tiếng Anh đúng với hình ảnh / nghĩa Tiếng Việt.
  - Mode 2: Ghép các mảnh chữ cái Tiếng Anh thành từ hoàn chỉnh.
- [x] Minigame 3: **Lật Thẻ Trí Nhớ Vũ Trụ (Cấp Thử Thách)** - Ghép cặp từ vựng & hình ảnh 12 thẻ.
- [x] Minigame 4: **Tìm Điểm Khác Biệt Vũ Trụ (Spot the Difference)** với tính năng Gợi Ý thông minh 💡.
- [x] Tích hợp giọng đọc phát âm Tiếng Anh chuẩn `en-US` TTS.
- [x] Lập trình logic ngẫu nhiên câu hỏi không trùng lặp và hệ thống tính điểm rèn tư duy.

### 4. Giai đoạn Âm thanh, Huy hiệu & Lưu trữ JSON (Audio & Persistence)
- [x] Nhạc nền (BGM) tươi vui với nút bật/tắt trên thanh công cụ và tự động mở khóa âm thanh khi chạm màn hình (`unlockAudioOnFirstTouch`).
- [x] Hiệu ứng âm thanh (SFX) zero-latency bằng Web Audio API (Click, Ting Ting đúng, Tèo Teo sai, Phóng tên lửa, Nhận huy hiệu).
- [x] **Tủ Huy Hiệu (Badges Panel):** Tự động ghi nhận thành tích (Chuyên gia màu sắc, Phi hành gia, Hiệp sĩ Tiếng Anh, Thần đồng tinh mắt,...).
- [x] **Hệ thống Lưu trữ Dữ liệu JSON (`d:\Project_Game\data\`):**
  - `tuankiet_data.json`: Dữ liệu bài học, điểm & huy hiệu của bé Kiệt.
  - `baonhi_data.json`: Dữ liệu toán học, tiếng Anh, điểm & huy hiệu của bé Nhi.
  - `english_vocab.json`: Bộ dữ liệu từ vựng Tiếng Anh theo chủ đề.
  - `badges_config.json`: Cấu hình toàn bộ danh mục huy hiệu.
- [x] **Báo Cáo Tiến Độ Học Tập của Bố Mẹ (Parent Analytics Dashboard):** Thống kê chi tiết thời gian, tổng số câu đã làm, tỷ lệ làm đúng và danh sách chi tiết các câu bé làm sai (Kèm đáp án đúng).
- [x] Tính năng **Xuất JSON (Export)** và **Nhập JSON (Import)** trên giao diện web để sao lưu & khôi phục dữ liệu giữa các thiết bị.

### 5. Giai đoạn Tối ưu Di động & Xuất bản (Mobile & Deployment)
- [x] Tối ưu hóa UI di động (Co giãn động `clamp()`, tắt `backdrop-filter blur` để máy mượt, không nóng, bỏ hiệu ứng nháy xanh tap highlight).
- [x] **Tích hợp PWA (Progressive Web App):** Hỗ trợ "Thêm vào màn hình chính", icon 3D sắc nét, mở full màn hình như App tải từ Store.
- [x] Đã public chính thức lên internet: [https://tanthiluong.netlify.app](https://tanthiluong.netlify.app)
- [x] Tạo đầy đủ tài liệu hướng dẫn trong thư mục `d:\Project_Game\doc\`:
  - `HUONG_DAN_NGUOI_CHOI.md`: Hướng dẫn người chơi & Danh mục tất cả các game.
  - `HUONG_DAN_PUBLISH.md`: Hướng dẫn cập nhật web lên Netlify.
  - `HUONG_DAN_PWA.md`: Hướng dẫn cài App trên iOS & Android.
  - `ke_hoach_luu_tru_json.md`: Kiến trúc lưu trữ JSON.
  - `game_plan.md`: Kế hoạch phát triển dự án master plan.

---

## 🚀 6. Định hướng Đóng góp & Nâng cấp Tương lai (Future Roadmap)

- [x] **Minigame Lật Thẻ Trí Nhớ Vũ Trụ (Space Memory Match):** Ghép cặp thẻ hình ảnh & chữ số/từ vựng cho 2 bé.
- [x] **Minigame Tìm Điểm Khác Biệt Vũ Trụ (Spot the Difference):** Luyện khả năng quan sát & tập trung cao độ.
- [ ] **Chế độ Thi đấu 2 Người (Versus Mode):** Cho phép Bảo Nhi và Tuấn Kiệt (hoặc Bố Mẹ) cùng chơi tính điểm thi đua trên 1 màn hình.
- [ ] **Thêm bảng khen thưởng tuần/tháng:** Theo dõi tần suất học tập của các bé.
