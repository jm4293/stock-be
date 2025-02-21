# 1. Node.js 20 기반 이미지 선택
FROM node:20-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치 (npm ci 사용하여 lock 파일 기준 설치)
RUN npm ci

# 5. 프로젝트 코드 복사
COPY . .

# 6. NestJS 빌드
RUN npm run build

# 7. 운영 환경용 이미지 생성
FROM node:20-alpine AS runner
WORKDIR /app

# 8. 실행에 필요한 파일만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 9. 포트 개방 (예: 3000번)
EXPOSE 3000

# 10. 실행 명령
CMD ["node", "dist/main"]

# 11. 빌드 명령
# docker build -t stock-be .