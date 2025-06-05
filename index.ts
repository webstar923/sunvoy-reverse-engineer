import axios from 'axios';
import * as tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import * as cheerio from 'cheerio';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as fs from 'fs';

const BASE_URL = 'https://challenge.sunvoy.com';
const API_URL = 'https://api.challenge.sunvoy.com';
const COOKIE_FILE = './cookies.json';

// --- Load and Save Cookie Jar ---

function loadCookieJar(): tough.CookieJar {
  const jar = new tough.CookieJar();
  if (fs.existsSync(COOKIE_FILE)) {
    const raw = fs.readFileSync(COOKIE_FILE, 'utf-8');
    const cookies = JSON.parse(raw);
    cookies.forEach((cookie: any) => {
      const deserialized = tough.Cookie.fromJSON(cookie);
      if (deserialized) {
        jar.setCookieSync(deserialized, BASE_URL);
      }
    });
  }
  return jar;
}

function saveCookieJar(jar: tough.CookieJar) {

  jar.getCookies(BASE_URL, (err, cookies) => {

    if (err) return console.error('Failed to save cookies:', err);
    

    const serialized = cookies.map(cookie => cookie.toJSON());

    fs.writeFileSync(COOKIE_FILE, JSON.stringify(serialized, null, 2));
  });
}

// --- Axios Client with Cookie Jar ---
const jar = loadCookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

// --- Get Login Nonce ---
async function getNonce(): Promise<string> {
  console.log('Fetching nonce...');
  const res = await client.get(`${BASE_URL}/login`);
  const $ = cheerio.load(res.data);
  return $('input[name="nonce"]').val() || '';
}

// --- Generate Signed API Payload ---
function createSignedRequest(fields: Record<string, string>): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payloadFields: Record<string, string> = { ...fields, timestamp };

  const sortedKeys = Object.keys(payloadFields).sort();
  const payloadString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(payloadFields[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha1', 'mys3cr3t');
  hmac.update(payloadString);
  const checkcode = hmac.digest('hex').toUpperCase();

  return `${payloadString}&checkcode=${checkcode}`;
}

// --- Scrape Tokens from HTML ---
async function getTokens(): Promise<string> {
  const res = await client.get(`${BASE_URL}/settings/tokens`);
  const $ = cheerio.load(res.data);
  const extract = (id: string) => $(`input#${id}`).val() || '';

  const token = {
    access_token: extract('access_token'),
    openId: extract('openId'),
    userId: extract('userId'),
    apiuser: extract('apiuser'),
    operateId: extract('operateId'),
    language: extract('language'),
  };

  return createSignedRequest(token);
}

// --- Check If Session Is Valid ---
async function isSessionValid(): Promise<boolean> {
  try {
    const res = await client.post(`${BASE_URL}/api/users`);
    return Array.isArray(res.data);
  } catch {
    return false;
  }
}

// --- Perform Login ---
async function login(): Promise<void> {
  const nonce = await getNonce();
  const loginData = qs.stringify({
    nonce,
    username: 'demo@example.org',
    password: 'test',
  });

  await client.post(`${BASE_URL}/login`, loginData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  console.log('Logged in successfully.');
}

// --- Main Execution ---
async function main(): Promise<void> {
  try {
    if (await isSessionValid()) {
      console.log('Reusing existing session.');
    } else {
      console.log('Logging in...');
      await login();
    }

    const usersRes = await client.post(`${BASE_URL}/api/users`);
    const signedPayload = await getTokens();

    const meRes = await client.post(`${API_URL}/api/settings`, signedPayload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = {
      users: usersRes.data,
      currentUser: meRes.data,
    };

    fs.writeFileSync(
      'users.json',
      JSON.stringify(data, (_key, value) => {
        return value;
      }, 2)
    );
    console.log('users.json created successfully.');

    saveCookieJar(jar);
  } catch (err: any) {
    if (err.response) {
      console.error('HTTP Error:', err.response.status, err.response.statusText);
      console.error('Response:', err.response.data);
    } else {
      console.error('Unexpected Error:', err.message);
    }
  }
}

main();
