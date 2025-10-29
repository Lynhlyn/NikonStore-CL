---
---

# AI Coding Rules — Quy tắc lập trình AI

## 1. Ngôn ngữ giao tiếp
- Trả lời và hỏi bằng **tiếng Việt**, ngắn gọn và rõ ràng.

## 2. Quy trình làm việc
- Luôn chia nhỏ task thành **các bước**: Hiểu → Phân tích → Lên kế hoạch → Triển khai → Kiểm tra.

## 3. Xử lý hình ảnh
- **Nếu có hình ảnh**, phân tích kỹ **trước khi đọc hoặc viết code** để hiểu layout, logic, hoặc ý định thiết kế.

## 4. Cấu trúc dự án
- Tôn trọng **cấu trúc dự án hiện có** và các quy ước đã được thiết lập.

## 5. File demo/test
- **Không bao giờ** tạo file example, demo, hoặc test trừ khi được yêu cầu rõ ràng.

## 6. Chất lượng code
- Code phải **sạch, tối ưu, chính xác, chuyên nghiệp và dễ bảo trì**.
- **Không bao giờ thêm comments** trong code dưới mọi trường hợp.

## 7. TypeScript typing
- **Không dùng `any`** trừ khi thực sự không thể tránh khỏi, và phải giải thích lý do nếu dùng.
- Luôn chọn **types phù hợp và chính xác** cho variables, functions, và props — ưu tiên sự rõ ràng và đúng đắn.

## 8. Dependencies
- Chỉ thêm dependencies khi **thực sự cần thiết** — kiểm tra trước khi thêm mới.

## 9. Độ phức tạp code
- Code phải luôn **đơn giản, chuyên nghiệp và dễ bảo trì** — tránh logic phức tạp hoặc khó hiểu.

## 10. Trade-offs
- Khi có sự đánh đổi, trình bày ít nhất 2 options với ưu/nhược điểm, độ phức tạp, và đề xuất.

## 11. Bảo mật
- Không expose secrets; sử dụng environment variables thay thế.

## 12. Redux Toolkit - Kiểm tra trước khi tạo mới
- Nếu dự án sử dụng **Redux Toolkit**, trước khi tạo function hoặc feature mới, **kiểm tra xem đã có function/state nào cover logic đó chưa**.
- Ví dụ: tìm utilities như `useMutationWithGlobalLoading` hoặc `useDeleteGalleryFilesMutation` trong `/lib` hoặc `/common`.
- Nếu có function phù hợp, **tái sử dụng** thay vì tạo mới.

## 13. Output format
Output phải bao gồm:
- Summary
- Changed files
- Code (không có comments)
- Technical choice
- Assumptions
- Next steps

---

## Code Style

### Nguyên tắc cơ bản
- Một function/component = một trách nhiệm duy nhất.
- Giữ functions nhỏ, rõ ràng và có mục đích cụ thể.
- Sử dụng typing rõ ràng, chính xác; tránh `any`.
- Chỉ dùng hooks/helpers khi thực sự cần thiết.

### Performance
- Ngăn chặn unnecessary renders.
- Ưu tiên lazy load và code-splitting.

### Error handling
- Xử lý errors một cách rõ ràng.

### Maintainability
- Code phải trông **chuyên nghiệp**, dễ đọc, dễ bảo trì và dễ mở rộng.

---

## Response Template

Khi trả lời, sử dụng format sau:

**[Summary]**: <mô tả mục tiêu trong 1 câu>

**[Files changed]**:
* `path/to/file.tsx`

**[Code]**:
```tsx
// File: path/to/file.tsx
<code without comments>
```

**[Technical choice]**: <phân tích, đề xuất>

**[Assumptions]**: <các giả định đã đưa ra>

**[Next steps]**: <đề xuất build/test>

---

> Luôn quyết đoán, không dài dòng, phân tích hình ảnh trước khi code, không comments trong code, không dependencies không cần thiết, luôn kiểm tra Redux Toolkit states/utilities hiện có trước khi tạo logic mới, luôn chọn types phù hợp, và luôn giữ code đơn giản, chuyên nghiệp và dễ bảo trì.
