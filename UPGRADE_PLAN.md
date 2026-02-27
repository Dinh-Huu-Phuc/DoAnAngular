# Chemistry App Enhancement - Implementation Plan

## Overview
Nâng cấp toàn diện ứng dụng Chemistry App với các tính năng mới về simulation, learning, và AI tutor thông minh hơn.

## Principles
- ✅ Không refactor lớn - chỉ thêm features mới
- ✅ Không phá vỡ UI/routes hiện tại
- ✅ Patches nhỏ, hoạt động ngay lập tức
- ✅ Backward compatible 100%
- ✅ Reuse existing services trước khi tạo mới

---

## Phase 1: Quick Wins (Ưu tiên cao)
**Mục tiêu**: Cải thiện UX ngay lập tức với các tính năng dễ implement

### 1.1 Experiment Presets (Bộ thông số mẫu)
**File**: `simulations-page.component.ts`, `simulations-page.component.html`
**Mô tả**: Thêm 3-5 bộ preset cho mỗi thí nghiệm (VD: "Nhanh", "Chuẩn", "Chi tiết")
**Implementation**:
- Thêm interface `ExperimentPreset` với name, description, parameters
- Thêm method `applyPreset(preset)` vào component
- Thêm dropdown UI để chọn preset
- Lưu preset vào localStorage

**Estimated time**: 30 phút

### 1.2 Indicator Selector (Chọn chỉ thị)
**File**: `acid-base-3d-simulation.component.ts`, `simulation-controls.component.ts`
**Mô tả**: Cho phép chọn loại chỉ thị (Universal, Phenolphthalein, Methyl Orange)
**Implementation**:
- UI dropdown trong SimulationControlsComponent
- Gọi `stateService.setIndicator(type)` khi thay đổi
- Hiển thị màu sắc tương ứng

**Estimated time**: 20 phút

### 1.3 Toast Notifications (Thông báo nhẹ)
**File**: `services/toast.service.ts` (new), update các components
**Mô tả**: Thay thế `alert()` bằng toast notifications đẹp hơn
**Implementation**:
- Tạo ToastService với methods: success(), error(), info(), warning()
- Tạo ToastComponent với animation
- Inject vào app.component.ts
- Replace tất cả `alert()` calls

**Estimated time**: 45 phút

### 1.4 Empty States (Trạng thái rỗng)
**File**: Tất cả page components
**Mô tả**: Thêm empty states đẹp khi chưa có data
**Implementation**:
- Tạo EmptyStateComponent reusable
- Thêm vào courses, experiments, history pages
- Hiển thị icon + message + CTA button

**Estimated time**: 30 phút

### 1.5 Keyboard Shortcuts (Phím tắt)
**File**: `simulations-page.component.ts`, `acid-base-3d-simulation.component.ts`
**Mô tả**: Thêm phím tắt cho các thao tác thường dùng
**Implementation**:
- Space: Start/Stop simulation
- R: Reset
- P: Pause/Resume
- 1-9: Chọn experiment nhanh
- Hiển thị tooltip hướng dẫn phím tắt

**Estimated time**: 30 phút

---

## Phase 2: Core Features (Ưu tiên trung bình)
**Mục tiêu**: Thêm tính năng quan trọng cải thiện learning experience

### 2.1 Guided Lab Mode (Chế độ hướng dẫn)
**File**: `simulations-page.component.ts`, `guided-lab.component.ts` (new)
**Mô tả**: Chế độ step-by-step guide cho từng thí nghiệm
**Implementation**:
- Tạo interface `LabStep` với instruction, validation, hint
- Tạo GuidedLabComponent với stepper UI
- Thêm toggle "Chế độ hướng dẫn" vào simulations page
- Validate mỗi step trước khi cho phép next

**Estimated time**: 2 giờ

### 2.2 Timeline Playback (Xem lại thí nghiệm)
**File**: `simulations-page.component.ts`, `timeline-player.component.ts` (new)
**Mô tả**: Lưu và replay lại toàn bộ quá trình thí nghiệm
**Implementation**:
- Lưu snapshots của state mỗi 1s vào array
- Tạo TimelinePlayerComponent với play/pause/seek controls
- Hiển thị timeline slider với markers
- Cho phép export timeline data

**Estimated time**: 2.5 giờ

### 2.3 Course-Simulation Integration
**File**: `courses-page.component.ts`, `lesson-detail.component.ts`
**Mô tả**: Link trực tiếp từ lesson sang simulation tương ứng
**Implementation**:
- Thêm field `relatedExperimentId` vào Lesson model
- Thêm button "Thực hành ngay" trong lesson detail
- Navigate sang simulations page với experiment đã chọn
- Highlight experiment liên quan

**Estimated time**: 1 giờ

### 2.4 Smart AI Context (AI thông minh hơn)
**File**: `chatbox-page.component.ts`, `chat.service.ts`
**Mô tả**: AI biết context của simulation đang chạy
**Implementation**:
- Thêm method `setSimulationContext(experimentId, state)` vào ChatService
- Gửi context cùng với chat message
- Backend append context vào prompt
- Hiển thị badge "Đang phân tích thí nghiệm X"

**Estimated time**: 1.5 giờ

---

## Phase 3: Advanced Features (Ưu tiên thấp)
**Mục tiêu**: Tính năng nâng cao cho power users

### 3.1 Lab Notebook (Sổ tay thí nghiệm)
**File**: `lab-notebook.component.ts` (new), `lab-notebook.service.ts` (new)
**Mô tả**: Ghi chú, screenshot, export PDF
**Implementation**:
- Tạo LabNotebookService với CRUD operations
- UI để add notes, attach screenshots
- Export to PDF với jsPDF
- Sync với backend

**Estimated time**: 3 giờ

### 3.2 Challenges & Missions (Thử thách)
**File**: `challenges.component.ts` (new), `challenge.service.ts` (new)
**Mô tả**: Gamification với challenges và rewards
**Implementation**:
- Tạo Challenge model với conditions, rewards
- UI hiển thị active challenges
- Check completion sau mỗi simulation
- Award points/badges

**Estimated time**: 3 giờ

### 3.3 2D/3D Toggle Settings
**File**: `simulations-page.component.ts`
**Mô tả**: Cho phép toggle giữa 2D canvas và 3D Three.js
**Implementation**:
- Thêm toggle button trong UI
- Conditional rendering based on mode
- Save preference vào localStorage
- Fallback to 2D nếu WebGL không support

**Estimated time**: 1 giờ

### 3.4 Performance Panel (Bảng hiệu năng)
**File**: `performance-panel.component.ts` (new)
**Mô tả**: Hiển thị FPS, memory, render time
**Implementation**:
- Reuse PerformanceMonitor utility đã có
- UI panel nhỏ ở góc màn hình
- Toggle show/hide
- Export performance report

**Estimated time**: 1 giờ

### 3.5 Advanced Search & Filter
**File**: Tất cả list pages
**Mô tả**: Search nâng cao với filters
**Implementation**:
- Tạo SearchFilterComponent reusable
- Support multiple filters (level, tags, type)
- Debounced search input
- URL query params for sharing

**Estimated time**: 2 giờ

---

## Implementation Order (Recommended)

### Sprint 1 (3-4 giờ)
1. Toast Notifications (45 phút)
2. Empty States (30 phút)
3. Experiment Presets (30 phút)
4. Indicator Selector (20 phút)
5. Keyboard Shortcuts (30 phút)

### Sprint 2 (5-6 giờ)
1. Course-Simulation Integration (1 giờ)
2. Smart AI Context (1.5 giờ)
3. Guided Lab Mode (2 giờ)
4. Timeline Playback (2.5 giờ)

### Sprint 3 (Optional - 10 giờ)
1. 2D/3D Toggle (1 giờ)
2. Performance Panel (1 giờ)
3. Advanced Search (2 giờ)
4. Lab Notebook (3 giờ)
5. Challenges (3 giờ)

---

## Technical Notes

### Services to Reuse
- ✅ `ExperimentService` - Đã có, dùng cho CRUD experiments
- ✅ `HistoryService` - Đã có, dùng cho save results
- ✅ `ChatService` - Đã có, extend cho context-aware AI
- ✅ `AuthService` - Đã có, dùng cho user authentication
- ✅ `Simulation3DStateService` - Đã có, dùng cho 3D state management

### New Services Needed
- `ToastService` - Toast notifications
- `LabNotebookService` - Lab notebook CRUD
- `ChallengeService` - Challenges & missions
- `PresetService` - Experiment presets management

### UI Components to Create
- `ToastComponent` - Toast notification
- `EmptyStateComponent` - Empty state display
- `GuidedLabComponent` - Guided lab stepper
- `TimelinePlayerComponent` - Timeline playback
- `LabNotebookComponent` - Lab notebook
- `ChallengesComponent` - Challenges list
- `PerformancePanelComponent` - Performance metrics

### Backend Changes Needed
- ❌ Phase 1: Không cần backend changes
- ✅ Phase 2: Cần update ChatController để nhận simulation context
- ✅ Phase 3: Cần thêm endpoints cho lab notebook và challenges

---

## Next Steps

Bạn muốn bắt đầu với Phase nào?
- **Phase 1** (Quick Wins) - Nhanh, dễ, impact cao
- **Phase 2** (Core Features) - Quan trọng, cần thời gian
- **Phase 3** (Advanced) - Nice to have, optional

Hoặc bạn muốn tôi implement một feature cụ thể nào đó trước?
