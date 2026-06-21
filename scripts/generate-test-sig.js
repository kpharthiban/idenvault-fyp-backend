#!/usr/bin/env node
/**
 * IdenVault — Test Signature Generator
 * Generates a valid ethers.js personal_sign signature for API-AUTH-03.
 *
 * Run ONCE before starting the Newman collection run. The script calls
 * GET /api/auth/nonce, signs the nonce with your test issuer private key,
 * and outputs the values you need to paste into the Postman environment.
 *
 * Usage:
 *   TEST_ISSUER_PRIVATE_KEY=0x<your_key> node generate-test-sig.js
 *   TEST_ISSUER_PRIVATE_KEY=0x<your_key> BASE_URL=http://localhost:3001 node generate-test-sig.js
 *
 * Requirements:
 *   - Node.js 18+ (uses built-in fetch)
 *   - ethers installed in the project (already a backend dependency)
 *     Run from backend repo root: node scripts/generate-test-sig.js
 *     Or install ethers globally: npm install -g ethers
 */

const { ethers } = require('ethers');

const PRIVATE_KEY = process.env.TEST_ISSUER_PRIVATE_KEY;
const BASE_URL = (process.env.BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

// ── Validation ─────────────────────────────────────────────────────────────

if (!PRIVATE_KEY) {
  console.error('\n[ERROR] TEST_ISSUER_PRIVATE_KEY is not set.');
  console.error('Usage: TEST_ISSUER_PRIVATE_KEY=0x... node generate-test-sig.js\n');
  process.exit(1);
}

if (!PRIVATE_KEY.startsWith('0x') || PRIVATE_KEY.length !== 66) {
  console.error('\n[ERROR] Private key must be a 32-byte hex string starting with 0x (66 chars total).\n');
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const address = wallet.address;

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║    IdenVault — Test Signature Generator          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log(`  Issuer wallet : ${address}`);
  console.log(`  Backend URL   : ${BASE_URL}`);

  // ── Step 1: Get nonce ────────────────────────────────────────────────────
  console.log('\n[1/2] Requesting nonce from backend...');
  let nonce;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/nonce?wallet=${address}`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    nonce = data.nonce;
    if (!nonce) throw new Error('Response did not contain a nonce field.');
    console.log(`  Nonce received : ${nonce}`);
  } catch (err) {
    console.error(`\n[ERROR] Could not fetch nonce: ${err.message}`);
    console.error(`  Make sure the backend is running at ${BASE_URL}\n`);
    process.exit(1);
  }

  // ── Step 2: Sign nonce ───────────────────────────────────────────────────
  console.log('\n[2/2] Signing nonce with private key...');
  const signature = await wallet.signMessage(nonce);
  console.log(`  Signature      : ${signature.slice(0, 20)}...${signature.slice(-10)}`);

  // ── Output ───────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  Paste these into your Postman Environment       ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  console.log(`  issuer_wallet  →  ${address}`);
  console.log(`  issuer_sig     →  ${signature}\n`);

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  IMPORTANT — Read before running Newman          ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  The nonce is stored in-memory on the backend.   ║');
  console.log('║  Run Newman immediately after pasting the values.║');
  console.log('║  Do NOT call GET /api/auth/nonce again for this  ║');
  console.log('║  wallet between now and AUTH-03 in the run —     ║');
  console.log('║  that would overwrite the stored nonce and       ║');
  console.log('║  invalidate the signature above.                 ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Newman run command:                             ║');
  console.log('║                                                  ║');
  console.log('║  newman run IdenVault_API_Collection.json \\      ║');
  console.log('║    -e IdenVault_Dev_Environment.json \\           ║');
  console.log('║    --reporters cli,htmlextra \\                   ║');
  console.log('║    --reporter-htmlextra-export \\                 ║');
  console.log('║    reports/api-test-report.html                  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});