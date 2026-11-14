# HƯỚNG DẪN CÀI ĐẶT “QUẢN LÝ $ CỦA KIM”

Link app sau khi xong: **https://kim1994.vercel.app**
Mật khẩu mặc định: **08051994@**

Làm trên **máy tính** (Chrome hoặc Edge) cho dễ. Tổng thời gian khoảng 20–30 phút, làm 1 lần là xong.

---

## Cách app chạy và lưu dữ liệu (đọc 1 phút)

| Dịch vụ | Làm gì |
|---|---|
| **GitHub** | Kho **kim1994** chứa code. Kho **kim1994-data** (riêng tư) chứa **dữ liệu** show, bầu show, thu chi. |
| **Vercel** | Chạy app ở link chính **kim1994.vercel.app**. Mở nhanh, không bao giờ "ngủ". |
| **Render** | Chạy **bản dự phòng** ở link **kim1994.onrender.com** (Bước 5). |

Cả Vercel và Render đều đọc/ghi **chung một kho dữ liệu kim1994-data**, nên nhập ở link nào thì link kia cũng thấy y hệt. Lỡ một bên bị lỗi, bạn vẫn mở được bên còn lại.

⚠️ Dữ liệu **không** lưu trên ổ đĩa của Render, vì gói miễn phí của Render xóa sạch ổ đĩa mỗi lần khởi động lại. Lưu ở GitHub thì miễn phí, không hết hạn và có lịch sử từng lần sửa.

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

## Bước 5 — Kết nối Render (bản dự phòng)

Làm sau khi Bước 4 đã chạy được. Render dùng **chính kho code kim1994** và **chính kho dữ liệu kim1994-data**.

1. Vào **https://render.com** → bấm **Get Started** (hoặc **Sign In**) → chọn **GitHub** → bấm **Authorize Render** nếu được hỏi.
2. Ở trang Dashboard, bấm nút **+ New** (góc phải trên) → chọn **Web Service**.
3. Mục **Source Code** / **Git Provider**: chọn **GitHub**.
   - Nếu chưa thấy kho **kim1994**: bấm **Configure account** (hoặc **Connect GitHub**) → trang GitHub mở ra → chọn **Only select repositories** → chọn **kim1994** → bấm **Save** (hoặc **Install**) → quay lại Render.
4. Bấm vào kho **kim1994** → bấm **Connect**.
5. Điền trang cài đặt:
   - **Name**: `kim1994` (tạo ra link kim1994.onrender.com; nếu tên đã có người dùng, Render tự thêm đuôi, VD `kim1994-ab12.onrender.com`)
   - **Language** (hoặc **Runtime**): chọn **Node**
   - **Branch**: `main`
   - **Region**: chọn **Singapore** (gần Việt Nam nhất)
   - **Root Directory**: để trống
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: chọn **Free**
6. Kéo xuống mục **Environment Variables** → bấm **+ Add Environment Variable**, thêm **đúng 3 dòng giống Vercel**:

| NAME_OF_VARIABLE | value |
|---|---|
| `GITHUB_TOKEN` | dãy `github_pat_…` ở Bước 3 (dán lại đúng dãy đó) |
| `GITHUB_REPO` | `tên-tài-khoản/kim1994-data` |
| `APP_PASSWORD` | `08051994@` (phải **giống hệt** bên Vercel) |

   Nếu sau này làm Bước 8 (thông báo), thêm cả `VAPID_PUBLIC_KEY` và `VAPID_PRIVATE_KEY` **giống hệt** bên Vercel.
7. Bấm nút **Deploy Web Service** ở cuối trang.
8. Chờ 2–4 phút. Khung nhật ký (Logs) hiện dòng **"Quản Lý $ Của Kim đang chạy ở cổng …"** và chữ **Live** màu xanh là xong.
9. Bấm vào link **…onrender.com** ở góc trên trái → nhập mật khẩu → phải thấy đúng dữ liệu đã nhập bên Vercel. ✅

**Lưu ý về Render miễn phí:**
- Không ai mở trong 15 phút thì Render cho app "ngủ". Lần mở kế tiếp phải **chờ khoảng 30–60 giây** để app thức dậy. Đây là bình thường, không mất dữ liệu.
- Vì vậy dùng hằng ngày nên mở **kim1994.vercel.app**. Link Render để dự phòng.
- Mỗi lần bạn tải code mới lên kho kim1994, Render tự cập nhật (giống Vercel).
- Đổi mật khẩu thì phải đổi **cả 2 nơi**: Vercel (Bước 9) và Render: vào dịch vụ **kim1994** trên Render → menu trái **Environment** → bấm ✏️ cạnh `APP_PASSWORD` → sửa → **Save, rebuild, and deploy**.

---

## Bước 6 — Thử app

1. Mở **https://kim1994.vercel.app** → gõ mật khẩu `08051994@` → bấm **Mở khóa**.
2. Màn hình khóa hiện ra ngay khi mở app. Vào tab **Thu chi** → bấm **Hớt tóc** → nhập `50000` → **Lưu**.
3. Mở lại kho **kim1994-data** trên GitHub → phải thấy thư mục **data** có file `config.json` và `thuchi-2026.json`. ✅ Lưu dữ liệu đã chạy.

**Nếu báo lỗi đỏ khi lưu:**
- *“Chưa cài GITHUB_TOKEN…”* → Bước 4 mục 5 chưa thêm biến, thêm vào rồi làm **Redeploy** (xem Bước 9).
- *“GitHub báo lỗi 401”* → token sai hoặc hết hạn → làm lại Bước 3, sửa `GITHUB_TOKEN`, Redeploy.
- *“…lỗi 403”* → token thiếu quyền **Contents: Read and write**.
- *“…lỗi 404”* → `GITHUB_REPO` viết sai, hoặc token chưa chọn kho kim1994-data.

---

## Bước 7 — Thêm icon app vào màn hình điện thoại

**iPhone / iPad**
1. Mở **Safari** (bắt buộc Safari), vào `kim1994.vercel.app`.
2. Bấm nút **Chia sẻ** (ô vuông có mũi tên chỉ lên, ở thanh dưới hoặc trên).
3. Kéo xuống chọn **Thêm vào MH chính** (Add to Home Screen). Có thể sửa tên hiện dưới icon.
4. Bấm **Thêm**. Mở app **bằng icon vừa tạo** → nhập mật khẩu.

**Android**: mở bằng Chrome → bấm **⋮** góc phải trên → **Thêm vào màn hình chính** → **Thêm**.

**Máy tính**: mở bằng Chrome/Edge → bấm biểu tượng **Cài đặt ứng dụng** ở cuối thanh địa chỉ → **Cài đặt**.

---

## Bước 8 — Thông báo nhắc show (trước 3 ngày, 1 ngày, 1 tiếng)

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
3. Làm **Redeploy** (xem Bước 9, mục 3). Nếu dùng Render, thêm 2 khóa này vào Render nữa (Bước 5 mục 6).
4. Vào **https://cron-job.org** → **Sign up** (miễn phí) → đăng nhập → bấm **Create cronjob**:
   - **Title**: `Nhac show Kim`
   - **URL**: dán **Link hẹn giờ (cron)** lấy ở mục 1 (dạng `https://kim1994.vercel.app/api/cron?key=…`)
   - **Execution schedule**: chọn **Every 15 minutes**
   - Bấm **Create**.
5. Quay lại app → **Cài đặt** → **Bật thông báo** → **Cho phép** → bấm **Gửi thử**. Có thông báo hiện lên là xong ✅.
   Làm mục 5 trên **mỗi máy** muốn nhận (iPhone, iPad…).

---

## Bước 9 — Đổi mật khẩu / sửa biến / Redeploy

1. Vercel → dự án **kim1994** → tab **Settings** → **Environment Variables**.
2. Dòng **APP_PASSWORD** → bấm **⋯** → **Edit** → gõ mật khẩu mới → **Save**.
3. **Redeploy** (bắt buộc sau khi sửa biến): tab **Deployments** → dòng trên cùng bấm **⋯** → **Redeploy** → bấm **Redeploy**.
   Sau khi đổi mật khẩu, các máy phải đăng nhập lại.

---

## Bước 10 — Cập nhật code sau này

Vào kho **kim1994** trên GitHub → **Add file** → **Upload files** → kéo các file mới vào (trùng tên sẽ ghi đè) → **Commit changes**. Vercel tự cập nhật sau khoảng 1 phút. Dữ liệu ở kho kim1994-data **không bị ảnh hưởng**.

---

## Cách dùng nhanh

- **Mở app là hỏi mật khẩu ngay.** Chưa nhập đúng thì không thấy gì cả. Tắt hẳn app, hoặc để app chạy nền quá 5 phút, thì lần sau phải nhập lại. Nút **🔒** góc phải trên để khóa ngay.
- **Trang chủ** (từ trên xuống):
  1. Hôm nay: ngày dương, ngày âm, hôm nay có show không, ngày lễ.
  2. **Lịch show**: các show sắp tới, nhóm theo ngày (Hôm nay / Ngày mai / Ngày kia…), có giờ và buổi (sáng, chiều, tối) tô màu khác nhau. Chạm 1 show để xem đầy đủ, gọi, mở bản đồ.
  3. **Thu chi**: 3 ô **Hôm nay / Tuần này / Tháng này** cho thấy ngay số tiền còn lại. Chạm 1 ô để xem chi tiết: tiền làm (hớt tóc + massage), bo tiệm tóc, thu show (nhận + bo), thu khác, tổng thu, tổng chi, còn lại.
  4. **Lịch âm dương** 3 tháng (VD tháng 11 → 11, 12, 1). Điện thoại xem từng tháng bằng 3 nút tháng; máy tính hiện cả 3. Số to là ngày dương, số nhỏ là ngày âm. **Chỉ ngày có show mới tô màu hồng**, chấm nhỏ màu cho biết show sáng (cam), chiều (xanh), tối (tím). Thu chi không tô màu lên lịch. Ngày lễ chỉ có chấm xám nhỏ, tên lễ ghi dưới mỗi tháng.
- **Thêm show**: mặc định ngày âm, không lặp lại. Chọn năm âm thì danh sách tháng **tự có tháng nhuận** nếu năm đó có (VD năm 2028 có "5 nhuận"), số ngày trong tháng cũng tự đúng 29 hoặc 30. Không cần tích gì.
- **Thu chi**: chọn ngày → bấm ô Hớt tóc / Massage / Tiền bo tiệm tóc / Tiền khác / Chi tiêu. ✏️ để sửa, 🗑️ để xóa. Cuối trang cũng có thống kê hôm nay / tuần / tháng.
- **Báo cáo**: theo tháng hoặc năm, tách riêng tiền làm và tiền bo, có tiết kiệm được bao nhiêu.
- **Cài đặt**: thanh dung lượng, xóa dữ liệu theo năm, tải file sao lưu, bật thông báo.
- **Xác nhận show hoàn thành**: khi show đã qua giờ diễn, app **không nhắc nữa** mà hiện khung xanh **"Xác nhận show hoàn thành"** ở đầu trang chủ (chuông cũng đếm số show chờ xác nhận).
  - Bấm **✅ Đã hoàn thành show** → kiểm tra/sửa **Tiền nhận show**, **Tiền bo show**, **Tiền khác của show** (kèm nội dung) → bấm **✅ Đã hoàn thành show**. Lúc này tiền mới được cộng vào thu chi và show biến khỏi khung xác nhận.
  - Bấm **❌ Hủy show** → chọn nhanh lý do (Khách hủy tiệc, Đổi ngày tiệc, Trùng lịch show khác…) hoặc tự gõ vào ô **Lý do hủy show** (bắt buộc) → bấm **Xác nhận hủy show**. Show không tính tiền, bị gạch tên, bỏ khỏi lịch. Lý do hiện trên thẻ show (bấm **📝 Sửa lý do** để sửa) và trong **Báo cáo** → mục Show → **Xem lý do các show đã hủy**.
  - Show chưa xác nhận thì **chưa cộng tiền** (thống kê ghi riêng "chờ xác nhận"). Show sắp tới cũng có nút **Hủy lần này** nếu biết trước là không đi diễn.
  - Lỡ bấm nhầm: vào tab **Show** → **Đã diễn** → bấm **↩️ Khôi phục show** (show đã hủy) hoặc **Sửa tiền** (show đã hoàn thành).
- **Kiểm tra kết nối dữ liệu** (cuối trang Cài đặt): tự kiểm tra mạng, máy chủ (Vercel hay Render), biến GITHUB_TOKEN / GITHUB_REPO, token còn hạn không, mở được kho dữ liệu không, có quyền ghi không. Dòng nào lỗi có dấu ❌ kèm **"👉 Cách sửa"**. Bấm **Kiểm tra lại** sau khi sửa.
- **Nhắc cập nhật số điện thoại**: số có 5 chữ số giống nhau liên tiếp trở lên (00000, 11111…) được coi là **số tạm**. Trang chủ hiện khung vàng "Cần cập nhật số điện thoại" kèm nút **Cập nhật** để sửa nhanh. Áp dụng cho show sắp diễn và danh sách bầu show.
- **Lịch**: Chủ nhật số màu đỏ. Mỗi năm một màu (2026 xanh lá, 2027 xanh biển, 2028 đỏ…). Ngày lễ dương nền xanh, ngày lễ âm nền vàng. Trên máy tính, rê chuột vào ngày có show sẽ hiện giờ, tên show, địa chỉ.

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
   "overrides": { "2026-11-28": { "status": "done", "received": 2500000, "tip": 300000, "other": 50000, "otherNote": "tiền xe" },
                  "2026-12-05": { "status": "cancel", "cancelReason": "Khách hủy tiệc, hoãn sang tháng 12" } },
                                             // tiền + trạng thái từng lần diễn: status "done" = đã hoàn thành, "cancel" = đã hủy
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

- Tất cả **0 đồng**: GitHub (kho riêng tư miễn phí), Vercel gói Hobby, Render gói Free, cron-job.org.
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
├── api/status.js           kiểm tra kết nối dữ liệu (Cài đặt)
├── server.js               máy chủ cho Render (Vercel không dùng)
├── api/_lib/…              phần dùng chung của máy chủ
├── sw.js                   chạy offline, nhận thông báo, số trên icon
├── manifest.webmanifest    thông tin app khi thêm vào màn hình
├── icons/                  icon app
├── fonts/                  (tùy chọn) font SVN-Avo
├── data-mau/data/          mẫu dữ liệu trống (không bắt buộc)
├── package.json, vercel.json
└── HUONG-DAN.md            file này
```
