# HƯỚNG DẪN CÀI ĐẶT “QUẢN LÝ $ CỦA KIM”

Link app sau khi xong: **https://kim1994.vercel.app**
Mật khẩu mặc định: **08051994@**

Làm trên **máy tính** (Chrome hoặc Edge) cho dễ. Tổng thời gian khoảng 20–30 phút, làm 1 lần là xong.

---

## Cách app lưu dữ liệu (đọc 1 phút)

App dùng **2 dịch vụ miễn phí**:

| Dịch vụ | Làm gì |
|---|---|
| **GitHub** | Có 2 kho (repository): kho **kim1994** chứa code, kho **kim1994-data** (riêng tư) chứa dữ liệu show, thu chi. |
| **Vercel** | Chạy trang web ở link kim1994.vercel.app, đọc/ghi dữ liệu vào kho kim1994-data. |

**Vì sao không dùng Render.com để lưu?** Gói miễn phí của Render không có ổ đĩa lưu lâu dài (máy chủ khởi động lại là mất file), còn cơ sở dữ liệu miễn phí của Render chỉ dùng được một thời gian rồi bị xóa. Lưu thẳng vào kho GitHub riêng tư thì **miễn phí, không hết hạn, có lịch sử từng lần sửa** (lỡ xóa nhầm vẫn xem lại được). Nên bộ này **không cần Render**.

Dữ liệu được tách mỗi năm 1 file, nên xóa theo năm rất gọn.

---

## Bước 1 — Tạo kho dữ liệu riêng tư `kim1994-data`

1. Vào **https://github.com** và đăng nhập (chưa có tài khoản thì bấm **Sign up** để tạo).
2. Góc **phải trên**, bấm dấu **＋** → chọn **New repository**.
3. Ô **Repository name**: gõ `kim1994-data`
4. Chọn **Private** (quan trọng — để người khác không xem được dữ liệu).
5. Bật công tắc / tích ô **Add README** (hoặc **Add a README file**).
6. Bấm nút xanh **Create repository**.

✅ Xong. Không cần tải gì lên kho này, app sẽ tự tạo thư mục `data` khi bạn lưu lần đầu.

---

## Bước 2 — Tạo kho code `kim1994` và tải code lên

1. Giải nén file **kim1994.zip** bạn tải về → được thư mục **kim1994**.
2. Trên GitHub, bấm **＋** (góc phải trên) → **New repository**.
3. **Repository name**: `kim1994` → chọn **Private** → **KHÔNG** tích Add README → bấm **Create repository**.
4. Ở trang kho trống vừa tạo, tìm dòng chữ *“…or create a new file or **uploading an existing file**”* → bấm vào chữ **uploading an existing file**.
5. Mở thư mục **kim1994** trên máy tính, bấm **Ctrl + A** (máy Mac: **Cmd + A**) để chọn **tất cả bên trong**, rồi **kéo thả** vào khung tải lên của GitHub.
   - Kéo các file/thư mục **bên trong** (index.html, api, css, js, lib, icons…), **không** kéo nguyên thư mục kim1994.
6. Chờ thanh tải chạy xong → kéo xuống dưới bấm nút xanh **Commit changes**.
7. Kiểm tra: trang kho phải thấy ngay các mục **api**, **css**, **icons**, **js**, **lib**, **index.html**, **package.json**, **sw.js**… Nếu chỉ thấy 1 thư mục tên `kim1994` thì bạn đã kéo nhầm cả thư mục → xóa kho, làm lại bước này.

---

## Bước 3 — Tạo “chìa khóa” (token) cho app ghi dữ liệu

1. Trên GitHub, bấm **ảnh đại diện** ở góc phải trên → **Settings**.
2. Kéo xuống cuối thanh bên trái → bấm **Developer settings**.
3. Bấm **Personal access tokens** → **Fine-grained tokens** → nút **Generate new token**.
4. Điền:
   - **Token name**: `kim1994`
   - **Expiration**: chọn **No expiration** (nếu không có thì chọn **Custom** → chọn ngày xa nhất có thể và ghi nhớ ngày đó để tạo lại).
   - **Repository access**: chọn **Only select repositories** → bấm ô **Select repositories** → chọn **kim1994-data**.
   - **Permissions**: mở phần **Repository permissions** (hoặc bấm **＋ Add permissions** rồi tích **Contents**) → dòng **Contents** chọn **Read and write**.
5. Kéo xuống bấm **Generate token** (nếu hiện hộp xác nhận thì bấm **Generate token** lần nữa).
6. GitHub hiện 1 dãy bắt đầu bằng `github_pat_…` → bấm biểu tượng **sao chép** bên cạnh, dán tạm vào ghi chú.
   ⚠️ Dãy này **chỉ hiện 1 lần** và là chìa khóa vào dữ liệu — **không gửi cho ai**.

---

## Bước 4 — Đưa app lên Vercel

1. Vào **https://vercel.com** → **Log in** → chọn **Continue with GitHub**.
2. Bấm nút **Add New…** (góc phải trên) → **Project**.
3. Ở mục **Import Git Repository**, tìm **kim1994** → bấm **Import**.
   - Không thấy kim1994? Bấm **Adjust GitHub App Permissions** → chọn **All repositories** (hoặc chọn thêm kim1994) → **Save** → quay lại.
4. Ở trang **Configure Project**:
   - **Project Name**: `kim1994` (tên này tạo ra link kim1994.vercel.app)
   - **Framework Preset**: chọn **Other**
   - **Root Directory**: để nguyên `./`
5. Bấm mở mục **Environment Variables** và thêm từng dòng (gõ **Key**, gõ **Value**, bấm **Add**):

| Key | Value |
|---|---|
| `GITHUB_TOKEN` | dãy `github_pat_…` ở Bước 3 |
| `GITHUB_REPO` | `tên-tài-khoản-github-của-bạn/kim1994-data` (VD: `kimnguyen/kim1994-data`) |
| `APP_PASSWORD` | `08051994@` (muốn mật khẩu khác thì gõ khác) |

   Tên tài khoản GitHub xem ở góc trên trang kho, chỗ ghi *tên-bạn / kim1994-data*.

6. Bấm **Deploy**. Chờ 1–2 phút, thấy pháo hoa 🎉 là xong → bấm **Continue to Dashboard**.
7. Kiểm tra link: ở trang dự án, mục **Domains** phải là `kim1994.vercel.app`.
   - Nếu Vercel đặt tên khác (vì `kim1994` đã có người dùng), vào tab **Settings** → **Domains** → bấm **Edit** cạnh link hiện có → gõ `kim1994.vercel.app` → **Save**. Nếu báo đã có người dùng thì phải chọn tên khác, VD `kim1994-show.vercel.app`.

---

## Bước 5 — Thử app

1. Mở **https://kim1994.vercel.app** → bấm **Đăng nhập** → gõ `08051994@`.
2. Vào tab **Thu chi** → bấm **Hớt tóc** → nhập `50000` → **Lưu**.
3. Mở lại kho **kim1994-data** trên GitHub → phải thấy thư mục **data** có file `config.json` và `thuchi-2026.json`. ✅ Lưu dữ liệu đã chạy.

**Nếu báo lỗi đỏ khi lưu:**
- *“Chưa cài GITHUB_TOKEN…”* → Bước 4 mục 5 chưa thêm biến, thêm vào rồi làm **Redeploy** (xem Bước 8).
- *“GitHub báo lỗi 401”* → token sai hoặc hết hạn → làm lại Bước 3, sửa `GITHUB_TOKEN`, Redeploy.
- *“…lỗi 403”* → token thiếu quyền **Contents: Read and write**.
- *“…lỗi 404”* → `GITHUB_REPO` viết sai, hoặc token chưa chọn kho kim1994-data.

---

## Bước 6 — Thêm icon app vào màn hình điện thoại

**iPhone / iPad**
1. Mở **Safari** (bắt buộc Safari), vào `kim1994.vercel.app`.
2. Bấm nút **Chia sẻ** (ô vuông có mũi tên chỉ lên, ở thanh dưới hoặc trên).
3. Kéo xuống chọn **Thêm vào MH chính** (Add to Home Screen). Có thể sửa tên hiện dưới icon.
4. Bấm **Thêm**. Mở app **bằng icon vừa tạo** rồi đăng nhập lại 1 lần.

**Android**: mở bằng Chrome → bấm **⋮** góc phải trên → **Thêm vào màn hình chính** → **Thêm**.

**Máy tính**: mở bằng Chrome/Edge → bấm biểu tượng **Cài đặt ứng dụng** ở cuối thanh địa chỉ → **Cài đặt**.

---

## Bước 7 — Thông báo nhắc show (trước 3 ngày, 1 ngày, 1 tiếng)

App có **3 cách nhắc**, từ dễ đến đầy đủ:

**Cách A — Thêm vào lịch nhắc (dễ nhất, chắc chắn nhất).**
Trên mỗi thẻ show bấm **Thêm vào lịch nhắc** → điện thoại mở Lịch → bấm **Thêm tất cả**. Lịch của máy sẽ tự nhắc trước 3 ngày, trước 1 ngày, trước 1 tiếng, kể cả khi tắt app.

**Cách B — Chuông trong app.** Chuông góc trên và icon app hiện số show trong 3 ngày tới. Vào **Cài đặt** → **Bật thông báo** → **Cho phép**: khi đang mở app sẽ được nhắc.
(iPhone/iPad: phải mở app từ icon ở Màn hình chính, iOS 16.4 trở lên.)

**Cách C — Nhắc cả khi đóng app (làm thêm 1 lần, khoảng 10 phút):**
1. Mở app **từ icon** → tab **Cài đặt** → mục 🔔 → bấm **Cài đặt nhắc khi đóng app** → bấm **Lấy mã cài đặt**.
2. App hiện 3 dòng. Vào **Vercel** → dự án **kim1994** → tab **Settings** → **Environment Variables**, thêm 2 dòng (bấm **Sao chép** trong app rồi dán):
   - Key `VAPID_PUBLIC_KEY` → Value: dòng VAPID_PUBLIC_KEY
   - Key `VAPID_PRIVATE_KEY` → Value: dòng VAPID_PRIVATE_KEY
   → bấm **Save**.
   ⚠️ Dùng **2 khóa của cùng 1 lần bấm**. Bấm “Lấy mã” lần nữa sẽ ra cặp mới.
3. Làm **Redeploy** (xem Bước 8, mục 3).
4. Vào **https://cron-job.org** → **Sign up** (miễn phí) → đăng nhập → bấm **Create cronjob**:
   - **Title**: `Nhac show Kim`
   - **URL**: dán **Link hẹn giờ (cron)** lấy ở mục 1 (dạng `https://kim1994.vercel.app/api/cron?key=…`)
   - **Execution schedule**: chọn **Every 15 minutes**
   - Bấm **Create**.
5. Quay lại app → **Cài đặt** → **Bật thông báo** → **Cho phép** → bấm **Gửi thử**. Có thông báo hiện lên là xong ✅.
   Làm mục 5 trên **mỗi máy** muốn nhận (iPhone, iPad…).

---

## Bước 8 — Đổi mật khẩu / sửa biến / Redeploy

1. Vercel → dự án **kim1994** → tab **Settings** → **Environment Variables**.
2. Dòng **APP_PASSWORD** → bấm **⋯** → **Edit** → gõ mật khẩu mới → **Save**.
3. **Redeploy** (bắt buộc sau khi sửa biến): tab **Deployments** → dòng trên cùng bấm **⋯** → **Redeploy** → bấm **Redeploy**.
   Sau khi đổi mật khẩu, các máy phải đăng nhập lại.

---

## Bước 9 — Cập nhật code sau này

Vào kho **kim1994** trên GitHub → **Add file** → **Upload files** → kéo các file mới vào (trùng tên sẽ ghi đè) → **Commit changes**. Vercel tự cập nhật sau khoảng 1 phút. Dữ liệu ở kho kim1994-data **không bị ảnh hưởng**.

---

## Cách dùng nhanh

- **Lịch**: hiện tháng này và 2 tháng kế (VD tháng 11 → 11, 12, 1). Số to là ngày dương (đậm), số nhỏ là ngày âm (nhạt). Ô **đỏ** = có show (số trắng góc ô = số show trong ngày). Chấm đỏ = ngày lễ, danh sách ngày lễ ở cuối mỗi tháng. Chạm 1 ngày để xem show + thu chi của ngày đó.
- **Thêm show**: mặc định chọn **ngày âm** và **không lặp lại**. Chọn giờ là app hiện ngay **Show sáng / trưa / chiều / tối lúc mấy giờ** với màu khác nhau, ngày nào có 2 show nhìn là phân biệt được.
- **SĐT**: thẻ show có nút **Gọi** (xanh lá) và **Zalo** (xanh dương), cả cho chủ tiệc và bầu show.
- **Tiền show**: bấm **Sửa tiền** để nhập/sửa tiền nhận và tiền bo bất cứ lúc nào. Show lặp lại thì sửa riêng từng lần.
- **Thu chi**: chọn ngày → bấm ô Hớt tóc / Massage / Tiền bo tiệm tóc / Tiền khác / Chi tiêu. Bấm ✏️ để sửa, 🗑️ để xóa.
- **Báo cáo**: theo tháng hoặc theo năm, tách rõ:
  - **Tiền làm** = Hớt tóc + Massage
  - **Tiền bo tiệm tóc** (riêng)
  - **Thu show** = tiền nhận show + tiền bo show (chỉ tính show đã diễn; show sắp diễn ghi riêng “dự kiến”)
  - **Thu khác**, **Chi tiêu** (gom theo nội dung) và **Tiết kiệm được** = tổng thu − tổng chi
- **Cài đặt**: thanh dung lượng, xóa dữ liệu theo năm (chọn năm → **Xóa năm này** → gõ lại năm để xác nhận), tải file sao lưu.

---

## Cấu trúc dữ liệu (trong kho kim1994-data)

```
data/
├── config.json        ← show, bầu show, thiết bị nhận thông báo
├── thuchi-2026.json   ← thu chi năm 2026
└── thuchi-2027.json   ← thu chi năm 2027 …
```

**config.json** (phần sau dấu `//` chỉ là giải thích, file thật không có)
```text
{
 "version": 1,
 "shows": [{
   "id": "mwf93wr9xljqa",
   "name": "Đám cưới anh Tuấn – chị Lan",
   "host": "Anh Tuấn",
   "bauId": "mwf93wr9ic0vi", "bauName": "Bầu Hải",
   "address": "12 Lê Lợi, Bảo Lộc",
   "map": "https://maps.app.goo.gl/…",
   "phone": "0912345678",
   "dateType": "am",                         // "am" = âm lịch, "duong" = dương lịch
   "date": "2026-11-28",                     // ngày dương của lần đầu
   "lunar": { "d": 20, "m": 10, "y": 2026, "leap": 0 },
   "time": "09:30",
   "repeat": "none",                         // "none" | "month" | "year"
   "received": 2500000, "tip": 0,            // tiền nhận show, tiền bo show
   "overrides": { "2027-01-07": { "received": 3000000, "tip": 200000 } },  // tiền riêng từng lần (show lặp)
   "note": ""
 }],
 "bauShows": [{ "id": "mwf93wr9ic0vi", "name": "Bầu Hải", "phone": "0909123456" }],
 "pushSubs": [],
 "sent": {}
}
```

**thuchi-2026.json**
```json
{
 "version": 1,
 "year": 2026,
 "entries": [
  { "id": "a1", "date": "2026-11-13", "type": "thu", "cat": "hottoc",  "amount": 80000,  "note": "" },
  { "id": "a2", "date": "2026-11-13", "type": "thu", "cat": "massage", "amount": 150000, "note": "" },
  { "id": "a3", "date": "2026-11-13", "type": "thu", "cat": "botiem",  "amount": 50000,  "note": "" },
  { "id": "a4", "date": "2026-11-13", "type": "thu", "cat": "khac",    "amount": 100000, "note": "Bán đồ cũ" },
  { "id": "a5", "date": "2026-11-13", "type": "chi", "cat": "chi",     "amount": 40000,  "note": "Ăn trưa" }
 ]
}
```
`cat`: `hottoc` Hớt tóc · `massage` Massage · `botiem` Tiền bo tiệm tóc · `khac` Tiền khác · `chi` Chi tiêu.

---

## Dung lượng & chi phí

- Tất cả **0 đồng**: GitHub (kho riêng tư miễn phí), Vercel gói Hobby, cron-job.org.
- Thanh dung lượng trong app tính trên mốc **1 GB** (GitHub khuyên kho dưới 1 GB). Mỗi năm thu chi chỉ khoảng vài trăm KB nên dùng được rất lâu. Khi cần, xóa năm cũ trong **Cài đặt**.
- GitHub giữ lịch sử từng lần lưu: lỡ xóa nhầm có thể vào kho kim1994-data → bấm vào file → **History** để xem bản cũ.

## Font chữ

App dùng **Nunito** (miễn phí, đủ dấu tiếng Việt, nét tròn giống SVN-Avo). Nếu bạn có file **SVN-Avo** bản quyền, xem `fonts/DOC-TRUOC.txt`.

## Danh sách file

```
kim1994/
├── index.html              trang chính
├── css/style.css           giao diện kiểu iOS 26
├── js/app.js               toàn bộ chức năng
├── lib/lunar.js            đổi ngày âm ↔ dương (giờ Việt Nam)
├── lib/core.js             ngày lễ, lặp lại show, tính tiền
├── api/login.js            đăng nhập
├── api/data.js             đọc/ghi show, bầu show, thu chi
├── api/push.js             đăng ký nhận thông báo, gửi thử
├── api/cron.js             gửi nhắc trước 3 ngày / 1 ngày / 1 tiếng
├── api/ics.js              tạo file lịch nhắc
├── api/keys.js             tạo khóa thông báo
├── api/_lib/…              phần dùng chung của máy chủ
├── sw.js                   chạy offline, nhận thông báo, số trên icon
├── manifest.webmanifest    thông tin app khi thêm vào màn hình
├── icons/                  icon app
├── fonts/                  (tùy chọn) font SVN-Avo
├── data-mau/data/          mẫu dữ liệu trống (không bắt buộc)
├── package.json, vercel.json
└── HUONG-DAN.md            file này
```
