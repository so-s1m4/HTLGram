# HTLGram

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/htlgram.git
   cd htlgram
   ```

## Docker Setup

The application uses the following services defined in `docker-compose.yml`:

* **hltgram-app**: The main Node.js application running on port 8000.
* **mongodb**: MongoDB database for persisting data.

Volumes:

* `public-data` mapped to `/var/lib/htlgram/public` inside the app container.
* `mongodb-data` mapped to `/var/lib/mysql/data` inside the MongoDB container.

## Available npm Scripts

| Script                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `npm run docker:build`  | Build the Docker image for the HTLGram application.         |
| `npm run compose:up`    | Start all services in detached mode using Docker Compose.   |
| `npm run compose:down`  | Stop and remove all containers and networks.                |
| `npm run logs`          | Stream logs from all running containers.                    |
| `npm run node -- <cmd>` | Execute a Node.js command inside the htlgram-app container. |

### Examples

* Build the Docker image:

  ```bash
  npm run docker:build
  ```

* Start the application:

  ```bash
  npm run compose:up
  ```

* View real-time logs:

  ```bash
  npm run logs
  ```

* Stop and clean up:

  ```bash
  npm run compose:down
  ```

* Run a custom Node.js script inside the container:

  ```bash
  npm run node -- scripts/seed.js
  ```

---

Happy coding!
