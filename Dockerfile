# Sử dụng image Node.js chính thức
FROM node:18

# Tạo thư mục app
WORKDIR /usr/src/app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --production

# Copy toàn bộ source code
COPY . .

# Expose port
EXPOSE 4000

# Lệnh start khi container khởi động
CMD ["npm", "start"] 