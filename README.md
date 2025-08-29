# 📨 HTLGram Backend  

**HTLGram** is a custom backend for the modern messenger [BlaBlaGram Frontend](https://github.com/so-s1m4/BlaBlaGram).  
The project is divided into two main parts:  

- **[Main Server](https://github.com/Leu3ery/HTLGram)** – handles all core features (authentication, chats, messages, emojis, etc.).  
- **[Media Server](https://github.com/Leu3ery/HTLGram-Mediaserver)** – responsible for storing and serving media files (photos, videos, documents).  

---

## 🚀 Tech Stack
- **Node.js + Express.js** – REST API  
- **TypeScript** – type safety and code reliability  
- **MongoDB (Mongoose)** – database  
- **Socket.IO** – real-time communication (messages, statuses)  
- **Multer** – file uploads  
- **Docker & Docker Compose** – containerization and deployment  
- **Git/GitHub** – version control  

---

## ⚙️ Local Setup

### 1. Clone the repositories
```bash
git clone https://github.com/Leu3ery/HTLGram.git
git clone https://github.com/Leu3ery/HTLGram-Mediaserver.git
```

### 2. Install dependencies
```bash
cd HTLGram
npm install

cd ../HTLGram-Mediaserver
npm install
```

### 3. Create .env files

📌 Main Server .env
```bash
PORT=8000
JWT_SECRET=jwt_secret
MONGO_URI=mongodb://localhost/dbname
PASSWORD_SALT=10
TIME_TO_DELETE_COMMUNICATION=10 # min
MEDIA_SERVER=http://localhost:8001
SEED_EMOJIS=false # Set to true to seed emojis on server start
PRIVATE_KEY_PATH=jwtRS256.key
DOMEN="*"
PRIVATE_KEY_BASE64=your_private_key
```

📌 Docker Compose .env
```bash
JWT_SECRET_COMPOSE=secret
MONGO_URI_COMPOSE=mongodb://username:pass@mongodb:27017/dbname?authSource=admin
PRIVATE_KEY_BASE64_COMPOSE=your_rsa_2048_private_key
PUBLIC_KEY_BASE64_COMPOSE=your_rsa_2048_public_key
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin_password
DOMEN="*"
```

### 4. Run servers

Main && Media server:
```bash
npx tsc
node dist/server.js
```

### 🐳 Run with Docker Compose

Create a .env file as shown above.

Start the project:
```bash
docker-compose up --build
```

## 🤝 Contributing

Feel free to fork and submit a pull request. Ideas and improvements are welcome!

## 📜 License

MIT License.