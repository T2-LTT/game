# Hướng Dẫn Cài Đặt Lưu Dữ Liệu Game & Danh Sách Bé Lên Google Sheets

**🔗 Link vào thẳng file Google Sheets của bạn:** 
👉 [Dữ Liệu Game Space](https://docs.google.com/spreadsheets/d/1KXg4WWl9sHdmTfuHQCDW7VG5vNlB48Ht5SRY6OXWRCU/edit?gid=0#gid=0)

Tài liệu này hướng dẫn chi tiết cách tạo một kết nối (API) thông qua Google Apps Script. 
Hệ thống này sẽ giúp bạn:
1. **Quản lý danh sách các bé (thêm, sửa, xoá)** thông qua Google Sheets.
2. **Lưu trữ toàn bộ lịch sử chơi và điểm số** tự động theo thời gian thực.

---

## Bước 1: Chuẩn bị file Google Sheets
1. Truy cập [Google Sheets](https://sheets.google.com) và tạo một **Bảng tính trống (Blank spreadsheet)**.
2. Đặt tên cho file (Ví dụ: `Dữ Liệu Game Space`).
3. Tạo và Đổi tên **Sheet 1** thành: `Điểm số Game`
   - Tại dòng đầu tiên (Header), gõ các cột: `Thời Gian` | `ID Bé` | `Tên Game` | `Hành Động` | `Số Điểm` | `Câu Hỏi` | `Đáp án chọn` | `Đáp án đúng` | `Kết quả`
4. Bấm dấu **+** ở góc dưới cùng bên trái để tạo **Sheet 2** và đổi tên thành: `Player`
   - Tại dòng đầu tiên, gõ chính xác 5 cột tiếng Anh: `id` | `name` | `yearOfBirth` | `avatar` | `color`
   - Từ dòng thứ 2 trở đi, điền thông tin của các bé vào (Ví dụ: `nhi`, `Bảo Nhi`, `2018`, `/image/baonhi.JPG`, `var(--neon-blue)`).

---

## Bước 2: Dán Mã Cầu Nối (Apps Script)
1. Trên thanh công cụ của Google Sheets, chọn menu **Tiện ích mở rộng (Extensions)** ➔ Bấm vào **Apps Script**.
2. Một cửa sổ viết mã sẽ hiện ra. Bạn hãy bôi đen và **xoá sạch** toàn bộ code cũ.
3. **Copy và dán** chính xác đoạn mã toàn diện dưới đây vào khung trắng:

```javascript
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Hành động: Lấy danh sách bé từ sheet Player
  if (e.parameter.action === 'getPlayers') {
    var sheet = ss.getSheetByName('Player');
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var headers = data[0]; 
    var result = [];
    
    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = data[i][j];
      }
      result.push(obj);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Mặc định: Trả về dữ liệu điểm
  var sheetName = (e.parameter.env === 'dev') ? 'Điểm số DEV' : 'Điểm số Game';
  var defaultSheet = ss.getSheetByName(sheetName) || ss.getSheetByName('Điểm số Game') || ss.getSheets()[0];
  var defaultData = defaultSheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(defaultData)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (typeof e === 'undefined' || !e.postData) {
    return ContentService.createTextOutput("Yêu cầu không hợp lệ").setMimeType(ContentService.MimeType.TEXT);
  }
  
  var data = JSON.parse(e.postData.contents);
  var sheetName = (data.env === 'dev') ? 'Điểm số DEV' : 'Điểm số Game';
  var sheet = ss.getSheetByName(sheetName) || ss.getSheetByName('Điểm số Game');
  if (!sheet) sheet = ss.getSheets()[0];
  
  var now = new Date();
  
  // Trích xuất dữ liệu, hỗ trợ cả ghi điểm lẫn ghi lịch sử đúng sai
  var action = data.action || '';
  var score = data.score !== undefined ? data.score : '';
  var question = data.question || '';
  var userAns = data.userAns || '';
  var correctAns = data.correctAns || '';
  var isCorrect = data.isCorrect !== undefined ? (data.isCorrect ? 'Đúng' : 'Sai') : '';
  
  sheet.appendRow([now, data.playerId || '', data.gameName || '', action, score, question, userAns, correctAns, isCorrect]);
  
  return ContentService.createTextOutput("Thành công").setMimeType(ContentService.MimeType.TEXT);
}
```
4. Bấm biểu tượng 💾 **Lưu dự án (Save)** ở thanh công cụ phía trên.

---

## Bước 3: Triển Khai và Lấy Web App URL
*Đây là bước quan trọng nhất để tạo ra đường dẫn API mở cho Game kết nối vào.*

1. Ở góc trên cùng bên phải màn hình Apps Script, bấm nút màu xanh **Triển khai (Deploy)** ➔ **Triển khai mới (New deployment)**.
2. Bấm vào **biểu tượng Bánh răng (⚙️)** ➔ Chọn **Ứng dụng web (Web app)**.
3. Chỗ **Quyền truy cập (Who has access):** Bắt buộc chọn **Mọi người (Anyone)**.
4. Bấm **Triển khai (Deploy)** và xác thực quyền (Bấm Advanced ➔ Go to... ➔ Allow).
5. Cuối cùng, copy đường link dài loằng ngoằng dưới chữ **Web app URL**.

### ⚠️ Quan trọng: Khi cần cập nhật Code mới
Nếu sau này bạn có dán code mới thay thế code cũ trong Apps Script, **ĐỪNG tạo Triển khai mới**. 
Hãy làm theo các bước sau để nâng cấp phiên bản nhằm **giữ nguyên đường link cũ**:
1. Bấm **Triển khai (Deploy)** ➔ Chọn **Quản lý công cụ triển khai (Manage deployments)**.
2. Bấm vào biểu tượng cây bút chì **(Chỉnh sửa)** ở góc trên bên phải.
3. Mục **Phiên bản (Version)**, xổ xuống và chọn **Phiên bản mới (New version)**.
4. Bấm nút **Triển khai** màu xanh ở dưới cùng.
