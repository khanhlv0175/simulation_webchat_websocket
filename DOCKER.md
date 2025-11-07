# Docker Setup Guide

Hướng dẫn chạy project bằng Docker và Docker Compose.

## Yêu cầu

- Docker
- Docker Compose

## Cách sử dụng

### 1. Chạy toàn bộ project ở chế độ production (mặc định)

```bash
docker compose up -d
```

Lệnh này sẽ:
- Build và chạy MongoDB container
- Build và chạy Backend container (port 8080) ở chế độ production (`npm start`)
- Build và chạy Frontend container (port 3000) ở chế độ production (`next start`)

### 2. Chạy ở chế độ development (hot reload)

```bash
docker compose --profile dev up
```

Lệnh này sẽ:
- Chia sẻ mã nguồn từ host vào container để hỗ trợ hot reload
- Cài đặt dependencies (nếu chưa có) và chạy `npm run dev` cho backend & frontend
- Sử dụng cùng MongoDB container như production

> 📌 Lần chạy đầu tiên sẽ mất thời gian lâu hơn vì `npm install` sẽ được thực thi bên trong container và lưu vào volume `backend_node_modules` / `frontend_node_modules`.

### 3. Xem logs

```bash
# Xem logs của tất cả services
docker compose logs -f

# Xem logs của một service cụ thể
docker compose logs -f backend           # production backend
docker compose logs -f frontend          # production frontend
docker compose logs -f backend-dev       # development backend
docker compose logs -f frontend-dev      # development frontend
docker compose logs -f mongodb
```

### 4. Dừng services

```bash
docker compose down
```

### 5. Dừng và xóa volumes (xóa dữ liệu MongoDB)

```bash
docker compose down -v
```

### 6. Rebuild containers

```bash
docker compose up -d --build
```

## Environment Variables

Tạo file `.env` ở thư mục root với các biến sau (tùy chọn):

```env
# Backend
JWT_SECRET=your-secret-key-change-in-production
MONGODB_URI=mongodb://mongodb:27017/webchat
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

Nếu không có file `.env`, các giá trị mặc định sẽ được sử dụng.

## Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: localhost:27017

## Cấu trúc Docker

- `backend/Dockerfile`: Multi-stage build cho backend Node.js/TypeScript
- `frontend/Dockerfile`: Multi-stage build cho Next.js frontend
- `docker-compose.yml`: Cấu hình cho tất cả services

## Troubleshooting

### Port đã được sử dụng

Nếu port 3000, 8080, hoặc 27017 đã được sử dụng, bạn có thể thay đổi trong `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Thay đổi port bên trái
```

### Rebuild lại từ đầu

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```


