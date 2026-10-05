#!/usr/bin/env node

/**
 * Diagnostic Script: Verify Local Ollama and Gemma Model Setup
 * Checks prerequisites safely without modifying files or system configuration.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const REQUIRED_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

console.log('====================================================');
console.log('   HACKTOBERFEST TRACKER - LOCAL AI DIAGNOSTICS     ');
console.log('====================================================\n');

async function runDiagnostics() {
  console.log(`[1/3] Checking Node.js runtime...`);
  console.log(`  ✓ Node.js version: ${process.version}`);

  console.log(`\n[2/3] Checking Ollama endpoint at ${OLLAMA_BASE_URL}...`);
  let tagsData = null;
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      console.error(`  ✗ Ollama responded with HTTP ${res.status}`);
      process.exit(1);
    }
    tagsData = await res.json();
    console.log(`  ✓ Ollama service is reachable and running.`);
  } catch (err) {
    console.error(`  ✗ Could not reach Ollama at ${OLLAMA_BASE_URL}`);
    console.error(`  Reason: ${err.message}`);
    console.log('\n--> Next Steps:');
    console.log('  1. Ensure Ollama is installed: https://ollama.com');
    console.log('  2. Start Ollama in your terminal: ollama serve');
    console.log(`  3. Download the model: ollama pull ${REQUIRED_MODEL}\n`);
    process.exit(1);
  }

  console.log(`\n[3/3] Checking for required Gemma model: '${REQUIRED_MODEL}'...`);
  const models = Array.isArray(tagsData.models) ? tagsData.models : [];
  const target = REQUIRED_MODEL.toLowerCase();
  const matched = models.find(m => {
    const name = (m.name || m.model || '').toLowerCase();
    return name === target || name.startsWith(target.split(':')[0]);
  });

  if (matched) {
    console.log(`  ✓ Found installed model: ${matched.name} (${Math.round((matched.size || 0) / 1024 / 1024 / 1024 * 10) / 10} GB)`);
    console.log('\n====================================================');
    console.log('  STATUS: LOCAL AI IS 100% READY!                   ');
    console.log('====================================================');
    console.log(`  Start the app: npm start`);
    console.log(`  Open in browser: http://localhost:3000/#create-plan\n`);
    process.exit(0);
  } else {
    console.warn(`  ⚠️ Required model '${REQUIRED_MODEL}' is NOT installed in Ollama.`);
    if (models.length > 0) {
      console.log(`  Currently installed models: ${models.map(m => m.name).join(', ')}`);
    } else {
      console.log(`  No models currently installed.`);
    }
    console.log('\n--> Next Step:');
    console.log(`  Run this command in your terminal to download the model:`);
    console.log(`  ollama pull ${REQUIRED_MODEL}\n`);
    process.exit(1);
  }
}

runDiagnostics();
