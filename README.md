# Sunvoy Reverse Engineering Challenge

This Node.js + TypeScript script logs into the [Sunvoy Challenge Website](https://challenge.sunvoy.com), scrapes authenticated user data, and saves it locally to `users.json`. It supports session reuse with cookie persistence to avoid repeated logins. It:

- Logs into the platform using demo credentials
- Scrapes a list of users via `/api/users`
- Fetches the authenticated user's settings using a signed HMAC-SHA1 request to `/api/settings`
- Caches login cookies in `cookies.json` to reuse sessions
- Outputs all data to a structured `users.json` file

---

##  Technologies

- Node.js
- TypeScript
- Axios with cookie jar support
- Cheerio (for HTML scraping)
- qs (form encoding)
- crypto (HMAC signing)
- tough-cookie (cookie jar handling)
- fs (filesystem)

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

### Video Link URL
https://www.loom.com/share/282f17f467554b9cb18ad8806dd13927?sid=f7c8ae78-3039-4d85-a2c3-2109ea09fca5