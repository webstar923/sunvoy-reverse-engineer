# Sunvoy Reverse Engineering Challenge

This Node.js project reverse-engineers a legacy web application at [https://challenge.sunvoy.com](https://challenge.sunvoy.com). It:

- Logs into the platform using demo credentials
- Scrapes a list of users via `/api/users`
- Fetches the authenticated user's settings using a signed HMAC-SHA1 request to `/api/settings`
- Caches login cookies in `cookies.json` to reuse sessions
- Outputs all data to a structured `users.json` file

---

## Features

- Session reuse using a persistent cookie jar
- Token scraping with cheerio
- Signed payload generation (HMAC-SHA1 with `mys3cr3t`)
- Clear and user-friendly console output
- Fully automated with no manual interaction required

---

## How to Run

### 1. Clone the Repository

  ```bash
  git clone https://github.com/YOUR_USERNAME/sunvoy-reverse-engineer.git
  cd sunvoy-reverse-engineer
  ```
### 2. Install Dependencies
  ```bash
    npm install
  ```
### 3. Run the Script
  ```bash
    npm run start
  ```
  This script will:
  - Log into the web app with demo credentials
  - Scrape the required nonce and authentication tokens
  - Generate a valid checkcode using HMAC-SHA1
  - Fetch data from /api/users and /api/settings
  - Output everything to a local users.json file

### Output File

  After execution, a file named users.json will be generated:
  
    {
      "users": [...],
      "currentUser": {...}
    }
    
### Notes
  Cookies are stored in cookies.json. If that file becomes corrupt, simply delete it and rerun the script.

### Author
Created by Zachary Speer for the Sunvoy Full Stack Engineer Challenge.

### Video URL
https://www.loom.com/share/46f006852528466494d0d1fcb7d0c7db?sid=cebc8059-d2cb-4233-b817-49600c5fc3e0
