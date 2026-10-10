# 📊 KẾ HOẠCH LƯU TRỮ ĐIỂM SỐ & HUY HIỆU DẠNG JSON

## 🎯 1. MỤC TIÊU DỰ ÁN
- Quản lý cấu trúc dữ liệu điểm số, thống kê học tập và huy hiệu cho 2 bé (**Tuấn Kiệt** và **Bảo Nhi**) dưới dạng các file **JSON chuẩn hóa**.
- Lưu giữ lâu dài trong thư mục `d:\Project_Game\data\`.
- Cung cấp tính năng **Sao lưu / Xuất file JSON (Export)** và **Khôi phục / Nhập file JSON (Import)** trực tiếp trên giao diện web game để có thể đồng bộ dữ liệu giữa các thiết bị di động khác nhau.

---

## 📁 2. CẤU TRÚC THƯ MỤC DỮ LIỆU (`d:\Project_Game\data\`)

| Tên File JSON | Chức Năng | Cấu Trúc Chính |
| :--- | :--- | :--- |
| **`tuankiet_data.json`** | Dữ liệu cá nhân, điểm & huy hiệu của bé Tuấn Kiệt (3 tuổi) | `player`, `summary`, `stats`, `badges` |
| **`baonhi_data.json`** | Dữ liệu cá nhân, điểm & huy hiệu của bé Bảo Nhi (8 tuổi) | `player`, `summary`, `stats`, `badges` |
| **`badges_config.json`** | Danh mục & điều kiện mở khóa tất cả các huy hiệu trong game | `badges` (id, owner, name, emoji, description) |

---

## 🛠️ 3. LUỒNG XỬ LÝ VÀ ĐỒNG BỘ DỮ LIỆU (DATA FLOW)

```
[Giao diện Game] ──(Cập nhật điểm)──> [Web Audio & State]
                                             │
                                   (Lưu thời gian thực)
                                             ▼
                                      [localStorage]
                                     ┌───────┴───────┐
                              (Xuất JSON)      (Nhập JSON)
                                     ▼               ▼
                              [Tải về máy]     [Khôi phục dữ liệu]
```

---

## 📋 4. CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Bước 1: Khởi tạo file JSON gốc tại thư mục `data/`
- Tạo 3 file JSON mẫu: `tuankiet_data.json`, `baonhi_data.json` và `badges_config.json`.

### Bước 2: Tích hợp Module `src/utils/jsonStorage.js`
- Quản lý việc nạp dữ liệu mẫu ban đầu từ JSON.
- Đóng gói hàm `exportDataToJSONFile()` (tải về file `.json` tự động).
- Đóng gói hàm `importDataFromJSON()` (đọc file `.json` được tải lên từ máy tính/điện thoại).

### Bước 3: Thêm Giao diện Quản lý JSON vào `BadgesPanel.jsx` (Tủ Huy Hiệu)
- Tích hợp 2 nút thao tác tiện lợi:
  - 📥 **"Xuất JSON"**: Cho phép bố mẹ bấm tải file sao lưu về máy.
  - 📤 **"Nhập JSON"**: Chọn file `.json` từ máy để tải lại toàn bộ thành tích đã có.

---

## ✅ 5. HƯỚNG DẪN KIỂM THỬ (VERIFICATION)
1. **Kiểm tra file lưu trữ:** Mở thư mục `d:\Project_Game\data` xem các file `.json` đã khởi tạo đúng định dạng chưa.
2. **Kiểm tra Xuất/Nhập JSON:**
   - Vào Tủ Huy Hiệu trên web ➔ Bấm **Xuất JSON**.
   - Kiểm tra file `.json` tải về máy.
   - Thử bấm **Nhập JSON** trên trình duyệt khác để kiểm tra tính đồng bộ thành tích.
