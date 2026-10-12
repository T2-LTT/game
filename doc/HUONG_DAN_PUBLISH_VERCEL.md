# HƯỚNG DẪN ĐƯA GAME LÊN MẠNG QUA VERCEL

Tài liệu này hướng dẫn bạn cách đưa game (deploy) lên Vercel một cách chuyên nghiệp và dễ dàng. Vercel là một nền tảng máy chủ miễn phí cực nhanh, chuyên dùng cho các ứng dụng React.

---

## Cách 1: Tự động Build thông qua GitHub (Khuyên dùng)
Cách này là nhàn nhất, bạn chỉ cần gõ lệnh đưa code lên GitHub, Vercel sẽ tự động phát hiện và Build (đóng gói) mọi thứ cho bạn.

1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Bấm nút **Add New...** -> **Project**.
3. Tại phần "Import Git Repository", tìm kho chứa game của bạn (ví dụ: `T2-LTT/game`) và bấm **Import**.
4. Giữ nguyên mọi cài đặt mặc định, bấm **Deploy**.
5. **Xong!** Từ nay về sau, mỗi khi bạn chạy lệnh `git push` để đẩy code mới lên GitHub, Vercel sẽ tự động cập nhật web cho bạn. 
*(Lưu ý: Đôi lúc nếu bạn đẩy code quá nhanh và liên tục, hệ thống an ninh của GitHub sẽ chặn Vercel khoảng 10-15 phút. Bạn chỉ cần pha tách trà ngồi đợi rồi bấm `Redeploy` trên Vercel là được).*

---

## Cách 2: Build thẳng từ máy tính (Bỏ qua GitHub)
Cách này cực kỳ hữu ích khi GitHub bị lỗi, hoặc bạn không muốn đợi GitHub đồng bộ. Bạn có thể đóng gói và "bắn" thẳng mã nguồn từ máy tính cá nhân của bạn lên thẳng máy chủ Vercel.

**Bước 1: Cài đặt công cụ Vercel CLI**
Mở cửa sổ Terminal (dấu `+` trong VSCode) và gõ lệnh:
```bash
npm install -g vercel
```
*(Nếu bạn đã từng chạy lệnh này rồi thì có thể bỏ qua).*

**Bước 2: Đăng nhập Vercel trên máy tính**
Gõ lệnh sau vào Terminal:
```bash
vercel login
```
Hệ thống sẽ hỏi bạn muốn đăng nhập bằng gì (GitHub, Email,...), dùng phím mũi tên để chọn và Enter. Một tab trình duyệt sẽ bật lên yêu cầu bạn xác nhận đăng nhập thành công.

**Bước 3: Đẩy Code lên (Deploy)**
Đảm bảo bạn đang mở Terminal ở thư mục gốc của dự án (ví dụ: `d:\Project_Game`). Gõ lệnh:
```bash
vercel --prod
```
- Ở lần đầu tiên, nó sẽ hỏi bạn một vài câu tiếng Anh (Ví dụ: *Set up and deploy?* Chọn Y. *Which scope?* Nhấn Enter mặc định. *Link to existing project?* Chọn N. *What's your project's name?* Nhấn Enter mặc định).
- Từ các lần sau, bạn chỉ cần gõ thêm chữ `--yes` ở cuối để nó tự động đồng ý mọi thứ:
```bash
vercel --prod --yes
```

**Hoàn tất!** Máy tính sẽ tốn vài chục giây để tải file lên. Khi xong, Terminal sẽ in ra một đường link (Vd: `https://game-t2.vercel.app`). Bạn Ctrl + Click vào link đó để chơi phiên bản mới nhất nhé!
