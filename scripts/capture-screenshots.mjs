#!/usr/bin/env node
/**
 * capture-screenshots.mjs — regenerates the product screenshots embedded in the docs
 * (public/images/screenshots/). Run after portal/IdP UI changes so images never go stale.
 *
 * Requires (dev box only):
 *   1. puppeteer-core + system Chrome (/usr/bin/google-chrome)
 *   2. Minted sessions written next to this script as token files:
 *      - devtok.txt  — dev-portal JWT:  cd dev-portal/backend && php artisan tinker --execute=
 *          '$d=\App\Models\Developer::find(154); echo \App\Support\DevJwt::access($d->id,$d->public_id);'
 *        (use a developer that owns an app; 154/app 150 at the time of writing)
 *      - orgtok.txt  — org-locked impersonation (real-org shots, e.g. Cisive org 31):
 *          \App\Support\DevJwt::impersonation(5, $sys->public_id, 31, 1)
 *      - idptok.txt  — IdP user JWT (consent screen):
 *          cd idp/backend && tinker: \Tymon\JWTAuth\Facades\JWTAuth::fromUser(User::find(56))
 *   3. The dev-portal SPA requires BOTH localStorage keys: `token` AND `user` (JSON).
 *      The IdP SPA requires access_token + refresh_token + token_expires_at + user.
 *
 * Usage: node scripts/capture-screenshots.mjs
 * Shots: portal dashboard / app quicksetup / settings / verification tab / workflow wizard /
 *        funds / webhook tester / organization (impersonated) / IdP consent / API playground.
 */


// ===== combined working implementation (adjust ids/paths as the header notes) =====
/*
import puppeteer from "puppeteer-core";
import { readFileSync, mkdirSync } from "node:fs";

const S = "/tmp/claude-1011/-var-www-pollus-main-servers/10aaa86d-ae35-4e11-9106-5587b08ade48/scratchpad";
const OUT = "/var/www/pollus_main_servers/docs-nextra/public/images/screenshots";
mkdirSync(OUT, { recursive: true });
const devTok = readFileSync(S + "/devtok.txt", "utf8").trim();
const idpTok = readFileSync(S + "/tok.txt", "utf8").trim();

const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,900"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

async function shot(name) {
  await new Promise((r) => setTimeout(r, 1800));
  await p.screenshot({ path: `${OUT}/${name}.png` });
  console.log("✓", name);
}

// ---- Dev portal (inject token) ----
await p.goto("https://dev.valyd.work/", { waitUntil: "domcontentloaded" });
await p.evaluate((t) => {
  localStorage.setItem("token", t);
  localStorage.setItem("user", JSON.stringify({ id: 154, email: "alihassan.4dev@gmail.com", full_name: "Ali Hassan" }));
}, devTok);
await p.goto("https://dev.valyd.work/dashboard", { waitUntil: "networkidle2" }).catch(() => {});
await shot("portal-dashboard");

// find first app id from the dashboard API
const apps = await p.evaluate(async () => {
  const r = await fetch("/api/projects", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });
  const d = await r.json();
  return (d.projects ?? d.data ?? []).map((x) => x.id);
});
console.log("apps:", apps.slice(0, 3));
const appId = apps[0];
if (appId) {
  await p.goto(`https://dev.valyd.work/apps/${appId}`, { waitUntil: "networkidle2" }).catch(() => {});
  await shot("portal-app-quicksetup");
  await p.goto(`https://dev.valyd.work/apps/${appId}?tab=settings`, { waitUntil: "networkidle2" }).catch(() => {});
  await shot("portal-app-settings");
  await p.goto(`https://dev.valyd.work/apps/${appId}?tab=workflows`, { waitUntil: "networkidle2" }).catch(() => {});
  await shot("portal-app-verification");
}

// ---- IdP consent screen (inject session) ----
await p.goto("https://idp.valyd.work/login", { waitUntil: "domcontentloaded" });
await p.evaluate((t) => {
  localStorage.setItem("access_token", t);
  localStorage.setItem("refresh_token", t);
  localStorage.setItem("token_expires_at", String(Date.now() + 3500 * 1000));
  localStorage.setItem("user", JSON.stringify({ id: 56, username: "valyd_fcxbjs" }));
}, idpTok);
await p.goto("https://idp.valyd.work/oauth/consent?client_id=b09df9adeb8a4a309b474424262906a8&redirect_url=https%3A%2F%2Fcisive.valyd.work%2Fapi%2Fauth%2Fvalyd%2Fcallback&idp_type=oidc&state=shotstate&nonce=shotnonce&scope=openid+profile+verifications&product_name=Cisive", { waitUntil: "networkidle2" }).catch(() => {});
await shot("idp-consent-screen");

await b.close();
console.log("done →", OUT);


// ===== shots2 =====
import puppeteer from "puppeteer-core";
import { readFileSync, mkdirSync } from "node:fs";

const S = "/tmp/claude-1011/-var-www-pollus-main-servers/10aaa86d-ae35-4e11-9106-5587b08ade48/scratchpad";
const OUT = "/var/www/pollus_main_servers/docs-nextra/public/images/screenshots";
mkdirSync(OUT, { recursive: true });
const devTok = readFileSync(S + "/devtok.txt", "utf8").trim();

const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,900"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(name) { await wait(1800); await p.screenshot({ path: `${OUT}/${name}.png` }); console.log("✓", name); }

// portal session (dev 154 owns app 150)
await p.goto("https://dev.valyd.work/", { waitUntil: "domcontentloaded" });
await p.evaluate((t) => {
  localStorage.setItem("token", t);
  localStorage.setItem("user", JSON.stringify({ id: 154, email: "alihassan.4dev@gmail.com", full_name: "Ali Hassan" }));
}, devTok);

// 1. Transactions / funds page ($100 credit note)
await p.goto("https://dev.valyd.work/transactions", { waitUntil: "networkidle2" }).catch(() => {});
await shot("portal-funds");

// 2. Webhook tester block — lives in the app's Verification tab (VerificationPanel webhook card)
await p.goto("https://dev.valyd.work/apps/150?tab=workflows", { waitUntil: "networkidle2" }).catch(() => {});
await wait(1500);
// scroll to webhook section if present
await p.evaluate(() => {
  const el = [...document.querySelectorAll("*")].find((e) => /webhook/i.test(e.textContent ?? "") && e.tagName.match(/^H[2-4]$/i));
  el?.scrollIntoView({ block: "start" });
});
await shot("portal-webhook-tester");

// 3. Workflow wizard (new workflow page)
const verifyMeta = await p.evaluate(async () => {
  const r = await fetch("/api/verify/app/150/verification", { headers: { Authorization: "Bearer " + localStorage.getItem("token") } });
  return (await r.json())?.verification ?? null;
});
console.log("verify project:", verifyMeta?.project_id);
if (verifyMeta?.project_id) {
  await p.goto(`https://dev.valyd.work/verifications/${verifyMeta.project_id}/new-workflow?app=150`, { waitUntil: "networkidle2" }).catch(() => {});
  await shot("portal-workflow-wizard");
}

// 4. Organization page via ADMIN impersonation (real org view: Cisive)
const p2 = await b.newPage();
await p2.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
// find admin panel origin
await p2.goto("https://admin-dev.pollus.tech/", { waitUntil: "networkidle2" }).catch(() => {});
console.log("admin page title:", await p2.title().catch(() => "?"), p2.url());
await b.close();
console.log("done");


// ===== shots3 =====
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
const S = "/tmp/claude-1011/-var-www-pollus-main-servers/10aaa86d-ae35-4e11-9106-5587b08ade48/scratchpad";
const OUT = "/var/www/pollus_main_servers/docs-nextra/public/images/screenshots";
const orgTok = readFileSync(S + "/orgtok.txt", "utf8").trim();

const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await p.goto("https://dev.valyd.work/", { waitUntil: "domcontentloaded" });
await p.evaluate((t) => {
  localStorage.setItem("token", t);
  localStorage.setItem("user", JSON.stringify({ id: 5, email: "console@cisive.example", full_name: "Cisive Console" }));
  localStorage.setItem("active_org_id", "31");
}, orgTok);
await p.goto("https://dev.valyd.work/organization", { waitUntil: "networkidle2" }).catch(() => {});
await wait(2000);
await p.screenshot({ path: `${OUT}/portal-organization.png` });
console.log("✓ portal-organization");

// API Playground (docs sandbox) — public
await p.goto("https://docs.valyd.work/sandbox", { waitUntil: "networkidle2" }).catch(() => {});
await wait(1500);
await p.screenshot({ path: `${OUT}/docs-api-playground.png` });
console.log("✓ docs-api-playground");
await b.close();

*/
