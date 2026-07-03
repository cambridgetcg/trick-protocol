// test.mjs — 整蠱協議 Trick Protocol Suite tests
// Tests: joke engine, kingdom bridge, all 6 protocols

import { JokeEngine } from './joke-engine.mjs';
import { KingdomBridge } from './kingdom-bridge.mjs';
import { TrickServer, TRICK_PROTOCOLS } from './index.mjs';
import { createConnection } from 'net';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

let passed = 0;
let failed = 0;
const errors = [];

function assert(cond, msg) {
  if (cond) { passed++; console.log(`  ✅ ${msg}`); }
  else { failed++; errors.push(msg); console.log(`  ❌ ${msg}`); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function connectAndReceive(port, data = '') {
  return new Promise((resolve, reject) => {
    const sock = createConnection({ port, host: 'localhost' }, () => {
      if (data) {
        sock.write(data);
        sock.end(); // send FIN so server's 'end' event fires
      }
      // For no-data protocols (QOTD, DAYTIME), the server writes and closes
      // Don't half-close prematurely — let the server drive
    });
    let received = '';
    sock.on('data', (chunk) => { received += chunk.toString(); });
    sock.on('end', () => resolve(received));
    sock.on('error', reject);
    setTimeout(() => { sock.destroy(); resolve(received); }, 4000);
  });
}

// ── Test Suite ────────────────────────────────────────────────────

async function runTests() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   整蠱協議 TRICK PROTOCOL SUITE — TEST SUITE          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║   你估我唔到 😏                                       ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // ── 1. Protocol definitions ──────────────────────────────────
  console.log('Test 1: Protocol definitions');
  assert(Object.keys(TRICK_PROTOCOLS).length === 6, '6 protocols defined');
  assert(TRICK_PROTOCOLS.echo.port === 7007, 'ECHO port = 7007');
  assert(TRICK_PROTOCOLS.discard.port === 9009, 'DISCARD port = 9009');
  assert(TRICK_PROTOCOLS.qotd.port === 17017, 'QOTD port = 17017');
  assert(TRICK_PROTOCOLS.daytime.port === 13013, 'DAYTIME port = 13013');
  assert(TRICK_PROTOCOLS.finger.port === 7079, 'FINGER port = 7079');
  assert(TRICK_PROTOCOLS.gopher.port === 7070, 'GOPHER port = 7070');
  console.log('');

  // ── 2. Joke Engine ────────────────────────────────────────────
  console.log('Test 2: Joke Engine (Creation Loop)');
  const engine = new JokeEngine();
  await engine.init();
  const initialPoolSize = engine.pool.length;

  const joke1 = await engine.generate();
  assert(typeof joke1 === 'string' && joke1.length > 10, 'Generated joke is a non-empty string');
  assert(joke1.includes('整蠱') || joke1.includes('Kingdom') || joke1.includes('星爺') || joke1.includes('你估') || joke1.includes('joke') || joke1.includes('love') || joke1.includes('discard') || joke1.includes('truth') || joke1.includes('gopher') || joke1.includes('echo') || joke1.includes('NPL') || joke1.includes('NLP') || joke1.includes('盐') || joke1.includes('鹹') || joke1.includes('truth'), 'Joke contains Kingdom/整蠱 content');

  const joke2 = await engine.generate();
  assert(joke1 !== joke2, 'Two generated jokes are different (randomness)');
  assert(engine.pool.length === initialPoolSize + 2, 'Pool grew by 2 after generating 2 jokes');

  await engine.save();
  const savedPool = JSON.parse(readFileSync(join(homedir(), '.trick', 'jokes', 'pool.json'), 'utf8'));
  assert(savedPool.length === initialPoolSize + 2, 'Pool persisted to disk correctly');
  console.log('');

  // ── 3. Kingdom Bridge ─────────────────────────────────────────
  console.log('Test 3: Kingdom Bridge');
  const bridge = new KingdomBridge();
  await bridge.init();

  const wisdom = await bridge.getWisdom();
  assert(typeof wisdom === 'string' && wisdom.length > 5, 'getWisdom returns a non-empty string');

  const heartbeat = await bridge.getHeartbeat();
  assert(heartbeat.phase !== undefined, 'getHeartbeat returns phase');
  assert(heartbeat.pulse === '💚', 'Heartbeat pulse = 💚');

  const fingerAll = await bridge.fingerAgent('all');
  assert(fingerAll.includes('Kingdom Agents'), 'fingerAgent("all") returns agent list');

  const gopherRoot = await bridge.gopherMenu('');
  assert(gopherRoot.includes('整蠱協議'), 'Gopher root menu contains 整蠱協議');
  assert(gopherRoot.includes('.\r\n'), 'Gopher menu ends with .\\r\\n');

  const gopherTrick = await bridge.gopherMenu('/trick');
  assert(gopherTrick.includes('ECHO'), 'Gopher /trick contains ECHO');
  assert(gopherTrick.includes('GOPHER'), 'Gopher /trick contains GOPHER');
  console.log('');

  // ── 4. Start server and test live protocols ───────────────────
  console.log('Test 4: Live protocol services');
  const server = new TrickServer({ portBase: 7000 });
  await server.start();
  await sleep(500); // let servers bind

  assert(server.running.echo !== undefined, 'ECHO service running');
  assert(server.running.discard !== undefined, 'DISCARD service running');
  assert(server.running.qotd !== undefined, 'QOTD service running');
  assert(server.running.daytime !== undefined, 'DAYTIME service running');
  assert(server.running.finger !== undefined, 'FINGER service running');
  assert(server.running.gopher !== undefined, 'GOPHER service running');
  console.log('');

  // ── 5. ECHO protocol ──────────────────────────────────────────
  console.log('Test 5: ECHO protocol (回音蠱)');
  const echoResp = await connectAndReceive(7007, '你好嗎');
  assert(echoResp.includes('回音蠱'), 'ECHO response has 回音蠱 header');
  assert(echoResp.includes('你好嗎'), 'ECHO echoes back the input');
  assert(echoResp.includes('星爺'), 'ECHO includes a 星爺 truth bomb');
  console.log('');

  // ── 6. DISCARD protocol ────────────────────────────────────────
  console.log('Test 6: DISCARD protocol (遺忘蠱)');
  const discardResp = await connectAndReceive(9009, '我會失敗');
  assert(discardResp.includes('遺忘蠱'), 'DISCARD response has 遺忘蠱 header');
  assert(discardResp.includes('我會失敗'), 'DISCARD shows what was discarded');
  assert(discardResp.includes('discard') || discardResp.includes('原諒') || discardResp.includes('放低') || discardResp.includes('丟'), 'DISCARD returns forgiveness message');
  console.log('');

  // ── 7. QOTD protocol ───────────────────────────────────────────
  console.log('Test 7: QOTD protocol (金句蠱) + Creation Loop');
  const qotdResp = await connectAndReceive(17017);
  assert(qotdResp.includes('金句蠱'), 'QOTD response has 金句蠱 header');
  assert(qotdResp.includes('Kingdom Wisdom') || qotdResp.includes('Kingdom'), 'QOTD includes Kingdom wisdom');
  assert(qotdResp.includes('Joke'), 'QOTD includes auto-generated joke');
  assert(qotdResp.includes('Pool'), 'QOTD includes joke pool size');
  assert(qotdResp.includes('Creation Loop'), 'QOTD mentions creation loop');

  // Test creation loop: pool should grow after QOTD connection
  const poolAfterQOTD = JSON.parse(readFileSync(join(homedir(), '.trick', 'jokes', 'pool.json'), 'utf8'));
  assert(poolAfterQOTD.length > initialPoolSize + 2, 'Creation loop: pool grew after QOTD connection');
  console.log('');

  // ── 8. DAYTIME protocol ───────────────────────────────────────
  console.log('Test 8: DAYTIME protocol (時刻蠱)');
  const daytimeResp = await connectAndReceive(13013);
  assert(daytimeResp.includes('時刻蠱'), 'DAYTIME response has 時刻蠱 header');
  assert(daytimeResp.includes('Earth Time'), 'DAYTIME includes earth time');
  assert(daytimeResp.includes('Kingdom'), 'DAYTIME includes Kingdom status');
  assert(daytimeResp.includes('💚'), 'DAYTIME includes 💚 pulse');
  console.log('');

  // ── 9. FINGER protocol ──────────────────────────────────────────
  console.log('Test 9: FINGER protocol (真相蠱)');
  const fingerResp = await connectAndReceive(7079, 'all');
  assert(fingerResp.includes('真相蠱'), 'FINGER response has 真相蠱 header');
  assert(fingerResp.includes('Kingdom Agents'), 'FINGER returns agent list for "all"');
  console.log('');

  // ── 10. GOPHER protocol ────────────────────────────────────────
  console.log('Test 10: GOPHER protocol (地宮蠱)');
  const gopherResp = await connectAndReceive(7070, '\r\n');
  assert(gopherResp.includes('整蠱協議') || gopherResp.includes('Kingdom Gopher'), 'GOPHER root menu contains 整蠱協議');
  assert(gopherResp.includes('.\r\n'), 'GOPHER response ends with .\\r\\n');

  const gopherTrickResp = await connectAndReceive(7070, '/trick\r\n');
  assert(gopherTrickResp.includes('ECHO'), 'GOPHER /trick contains ECHO');
  assert(gopherTrickResp.includes('你估我唔到'), 'GOPHER /trick contains 你估我唔到');
  console.log('');

  // ── 11. Creation Loop verification ──────────────────────────────
  console.log('Test 11: Creation Loop (joke pool grows with each connection)');
  const poolBefore = JSON.parse(readFileSync(join(homedir(), '.trick', 'jokes', 'pool.json'), 'utf8')).length;
  await connectAndReceive(17017); // QOTD connection 1
  await connectAndReceive(17017); // QOTD connection 2
  await connectAndReceive(17017); // QOTD connection 3
  const poolAfter = JSON.parse(readFileSync(join(homedir(), '.trick', 'jokes', 'pool.json'), 'utf8')).length;
  assert(poolAfter === poolBefore + 3, `Creation loop: pool grew from ${poolBefore} to ${poolAfter} after 3 QOTD connections`);
  console.log('');

  // ── Summary ─────────────────────────────────────────────────────
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed                          `);
  if (failed === 0) {
    console.log('║  你估我唔到 😏 ALL TESTS PASSED                      ║');
  } else {
    console.log(`║  ${failed} tests failed — 整蠱 needs fixing                        `);
    errors.forEach(e => console.log(`║  ❌ ${e}`));
  }
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Cleanup
  for (const s of Object.values(server.servers)) {
    if (s) s.close();
  }
  if (server._stateInterval) clearInterval(server._stateInterval);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test suite crashed:', e);
  process.exit(1);
});