# Quản Lý $ Của Kim

Web app (PWA) lịch âm dương 3 tháng, quản lý show, bầu show, thu chi tiệm tóc + show, báo cáo ngày/tháng/năm.
Chạy miễn phí trên **Vercel**, dữ liệu lưu trong **kho GitHub riêng tư**.

👉 Xem hướng dẫn từng bước: **[HUONG-DAN.md](HUONG-DAN.md)**

Biến môi trường trên Vercel:

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `GITHUB_TOKEN` | ✅ | Fine-grained token, quyền Contents: Read and write cho kho dữ liệu |
| `GITHUB_REPO` | ✅ | `tên-tài-khoản/kim1994-data` |
| `APP_PASSWORD` | | Mật khẩu đăng nhập (mặc định `08051994@`) |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | | Thông báo khi đóng app (lấy trong app: Cài đặt → Lấy mã cài đặt) |
| `GITHUB_BRANCH` | | Nhánh của kho dữ liệu (mặc định `main`) |
| `SECRET_KEY` | | Chuỗi bí mật riêng để ký phiên đăng nhập (không bắt buộc) |
