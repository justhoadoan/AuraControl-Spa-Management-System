# Route Guards Implementation - Testing Guide

## ✅ Đã Hoàn Thành:

### 1. **Cài đặt Dependencies**
- ✅ react-router-dom đã được cài đặt

### 2. **Route Guards Components**
- ✅ `ProtectedRoute.jsx` - Bảo vệ route chỉ cần authentication
- ✅ `RoleBasedRoute.jsx` - Bảo vệ route dựa trên role

### 3. **Pages Created**
- ✅ `Home.jsx` - Trang chủ (public)
- ✅ `Unauthorized.jsx` - Trang 403
- ✅ `MyAppointments.jsx` - Protected route
- ✅ `AdminDashboard.jsx` - Admin only
- ✅ `StaffDashboard.jsx` - Technician only

### 4. **Routing Configuration**
- ✅ App.jsx đã được cấu hình với React Router
- ✅ Login/SignUp redirect về home sau khi thành công
- ✅ Protected routes redirect về trang trước đó (state.from)

---

## 📋 Route Structure:

```
PUBLIC ROUTES:
├── / (Home)
├── /login (Login page)
├── /signup (SignUp page)
└── /unauthorized (403 page)

PROTECTED ROUTES (Chỉ cần đăng nhập):
└── /my-appointments (MyAppointments)

ROLE-BASED ROUTES:
├── /admin/* (ADMIN only)
└── /staff/* (TECHNICIAN only)
```

---

## 🧪 Testing Scenarios:

### Test 1: Chưa đăng nhập
1. Truy cập `/my-appointments` → Redirect về `/login`
2. Truy cập `/admin` → Redirect về `/login`
3. Truy cập `/staff` → Redirect về `/login`

### Test 2: Đăng nhập với role USER
1. Login thành công → Redirect về home
2. Truy cập `/my-appointments` → ✅ Cho phép
3. Truy cập `/admin` → Redirect về `/unauthorized`
4. Truy cập `/staff` → Redirect về `/unauthorized`

### Test 3: Đăng nhập với role ADMIN
1. Login thành công → Redirect về home
2. Truy cập `/my-appointments` → ✅ Cho phép
3. Truy cập `/admin` → ✅ Cho phép
4. Truy cập `/staff` → Redirect về `/unauthorized`

### Test 4: Đăng nhập với role TECHNICIAN
1. Login thành công → Redirect về home
2. Truy cập `/my-appointments` → ✅ Cho phép
3. Truy cập `/admin` → Redirect về `/unauthorized`
4. Truy cập `/staff` → ✅ Cho phép

### Test 5: Redirect Flow
1. Truy cập `/admin` khi chưa đăng nhập → Redirect về `/login`
2. Đăng nhập thành công → Redirect lại về `/admin` (nếu có quyền)

---

## 🚀 Để chạy:

```bash
cd Frontend
npm run dev
```

## 📝 Notes:

1. **ProtectedRoute**: Chỉ check `isAuthenticated`, không check role
2. **RoleBasedRoute**: Check cả `isAuthenticated` và `userRole`
3. **Login redirect**: Lưu `location.state.from` để redirect lại sau login
4. **Token validation**: AuthContext tự động check expiration khi load trang
5. **Unauthorized page**: Cung cấp 3 options: Go Back, Go Home, Logout
