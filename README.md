# ⚙️ PlayWave - Music Playlist Backend (API)

PlayWave is a high-performance, DSA-driven backend engine built with **Node.js**, **TypeScript**, and **Express**. It serves as the core logic provider for the music player, handling complex data operations with optimized algorithms and a structured MySQL database.

---

### 🎓 Academic Context
This project was developed to demonstrate the practical application of **Data Structures and Algorithms (DSA)** within a real-world server-side environment. It showcases how theoretical concepts like searching and list management directly impact the performance and scalability of a software application.

---

## 🏗️ Architecture: MVC (Model-View-Controller)
The project follows a structured MVC pattern for better maintainability:
* **Model:** Database schema managed via `db.ts` and MySQL.
* **Controller:** Business logic in `src/controllers/` (e.g., `userController.ts`).
* **Routes:** API endpoints defined in `src/routes/`.
* **Logic:** Custom implementations of **BST** and **DLL** for music management.

## 🧠 Data Structures & Logic
To optimize performance, we used:
1. **Doubly Linked List (DLL):** Used in `SongLinkedList.ts` to handle playlists. It allows $O(1)$ complexity for skipping to the next/previous song.
2. **Binary Search Tree (BST):** Used in `SongBST.ts` for song searching, providing $O(\log n)$ search efficiency.

## 💻 Tech Stack (Backend)

The backend is built with a focus on performance, type-safety, and scalable architecture:

* **Runtime Environment:** Node.js
* **Language:** TypeScript (for static typing and improved developer experience)
* **Framework:** Express.js (Fast and minimalist web framework)
* **Database:** MySQL (Relational database for structured data)
* **Database Driver:** `mysql2/promise` (Supports async/await for cleaner code)
* **Environment Management:** `dotenv` (To manage sensitive credentials safely)
* **Development Tools:** `ts-node-dev` (For auto-reloading during development)

## ⚙️ Setup & Installation
Follow these steps to set up and run the backend server locally:

1. **Clone the repo:**
   Copy and paste the following command in your terminal:
   ```bash
   git clone [https://github.com/Achinit99/Melodix-Backend-DSA.git](https://github.com/Achinit99/Melodix-Backend-DSA.git)

## Install Dependencies:
2. **npm install**

## Run the App:
3. **npm run dev**

## 🔗 Related Repository

**To see the user interface and how the music player works in action, please visit the frontend repository:**

* **Frontend UI:** [View Frontend Repository Here](https://github.com/Achinit99/Melodix-Frontend.git)
