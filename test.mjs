// test.mjs — 整蠱協議 Trick Protocol Suite + OG Gang tests
// Tests: joke engine, kingdom bridge, 12 protocols (6 original + 6 OG Gang)

import { JokeEngine } from './joke-engine.mjs';
import { KingdomBridge } from './kingdom-bridge.mjs';
import { TrickServer, TRICK_PROTOCOLS } from './index.mjs';
import { OGGangServer, OG_PROTOCOLS } from './og-gang.mjs';
import { CrossGangServer, CROSS_PROTOCOLS } from './cross-gang.mjs';
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

  // ── 12. OG Gang protocol definitions ──────────────────────────
  console.log('Test 12: OG Gang protocol definitions');
  assert(Object.keys(OG_PROTOCOLS).length === 6, '6 OG Gang protocols defined');
  assert(OG_PROTOCOLS.chargen.port === 19019, 'CHARGEN port = 19019');
  assert(OG_PROTOCOLS.time.port === 37037, 'TIME port = 37037');
  assert(OG_PROTOCOLS.whois.port === 43043, 'WHOIS port = 43043');
  assert(OG_PROTOCOLS.smtp.port === 25025, 'SMTP port = 25025');
  assert(OG_PROTOCOLS.nntp.port === 11911, 'NNTP port = 11911');
  assert(OG_PROTOCOLS.irc.port === 6667, 'IRC port = 6667');
  console.log('');

  // ── 13. Start OG Gang server ──────────────────────────────────
  console.log('Test 13: OG Gang live services');
  const ogServer = new OGGangServer();
  await ogServer.start();
  await sleep(500);

  assert(ogServer.running.chargen !== undefined, 'CHARGEN service running');
  assert(ogServer.running.time !== undefined, 'TIME service running');
  assert(ogServer.running.whois !== undefined, 'WHOIS service running');
  assert(ogServer.running.smtp !== undefined, 'SMTP service running');
  assert(ogServer.running.nntp !== undefined, 'NNTP service running');
  assert(ogServer.running.irc !== undefined, 'IRC service running');
  console.log('');

  // ── 14. CHARGEN protocol ──────────────────────────────────────
  console.log('Test 14: CHARGEN protocol (字元蠱)');
  const chargenResp = await connectAndReceive(19019, null);
  assert(chargenResp.length > 0, 'CHARGEN returns a non-empty stream');
  assert(chargenResp.includes('truth') || chargenResp.includes('Love') || chargenResp.includes('Kingdom') || chargenResp.includes('OG'), 'CHARGEN stream contains Kingdom truth');
  console.log('');

  // ── 15. TIME protocol ──────────────────────────────────────────
  console.log('Test 15: TIME protocol (時間蠱)');
  const timeResp = await connectAndReceive(37037, null);
  assert(timeResp.length >= 4, 'TIME returns at least 4 bytes (binary time)');
  assert(timeResp.includes('Kingdom') || timeResp.includes('💚'), 'TIME includes Kingdom text after binary');
  console.log('');

  // ── 16. WHOIS protocol ─────────────────────────────────────────
  console.log('Test 16: WHOIS protocol (身份蠱)');
  const whoisResp = await connectAndReceive(43043, 'npl');
  assert(whoisResp.length > 0, 'WHOIS returns a non-empty response');
  assert(whoisResp.includes('npl') || whoisResp.includes('NPL') || whoisResp.includes('phase') || whoisResp.includes('Kingdom'), 'WHOIS returns agent info');
  console.log('');

  // ── 17. SMTP protocol ──────────────────────────────────────────
  console.log('Test 17: SMTP protocol (書信蠱)');
  const smtpResp = await new Promise((resolve) => {
    const sock = createConnection({ port: 25025, host: 'localhost' }, () => {
      sock.write('HELO trick\r\n');
    });
    let data = '';
    sock.on('data', (d) => {
      data += d.toString();
      if (data.includes('220') && data.includes('HELO') === false && !data.includes('250')) return;
      if (data.includes('250') && !data.includes('MAIL')) {
        sock.write('MAIL FROM:<opal@kingdom>\r\n');
      }
      if (data.includes('250') && data.includes('From accepted') && !data.includes('RCPT')) {
        sock.write('RCPT TO:<wordcastle@kingdom>\r\n');
      }
      if (data.includes('250') && data.includes('Recipient') && !data.includes('DATA') && !data.includes('354')) {
        sock.write('DATA\r\n');
      }
      if (data.includes('354') && !data.includes('darshanqing')) {
        sock.write('Subject: darshanqing\r\nFrom: opal\r\nTo: wordcastle\r\n\r\ndarshanqing from:opal to:wordcastle\r\nM4 committed. Build clean.\r\n.\r\n');
      }
      if (data.includes('250 OK — 書信蠱')) {
        sock.write('QUIT\r\n');
      }
      if (data.includes('221')) {
        sock.end();
        resolve(data);
      }
    });
    setTimeout(() => { sock.destroy(); resolve(data); }, 5000);
  });
  assert(smtpResp.includes('220'), 'SMTP sends greeting (220)');
  assert(smtpResp.includes('250'), 'SMTP accepts HELO/MAIL/RCPT (250)');
  assert(smtpResp.includes('書信蠱') || smtpResp.includes('Mail delivered') || smtpResp.includes('Love is sharing'), 'SMTP delivers mail with Kingdom message');
  console.log('');

  // ── 18. NNTP protocol ──────────────────────────────────────────
  console.log('Test 18: NNTP protocol (新聞蠱)');
  const nntpResp = await new Promise((resolve) => {
    const sock = createConnection({ port: 11911, host: 'localhost' }, () => {
      sock.write('LIST\r\n');
    });
    let data = '';
    sock.on('data', (d) => {
      data += d.toString();
      if (data.includes('215') && data.includes('.\r\n')) {
        sock.write('QUIT\r\n');
      }
      if (data.includes('205')) {
        sock.end();
        resolve(data);
      }
    });
    setTimeout(() => { sock.destroy(); resolve(data); }, 5000);
  });
  assert(nntpResp.includes('200'), 'NNTP sends greeting (200)');
  assert(nntpResp.includes('215'), 'NNTP responds to LIST (215)');
  console.log('');

  // ── 19. IRC protocol ────────────────────────────────────────────
  console.log('Test 19: IRC protocol (聊天蠱)');
  const ircResp = await new Promise((resolve) => {
    const sock = createConnection({ port: 6667, host: 'localhost' }, () => {
      sock.write('NICK testuser\r\n');
    });
    let data = '';
    sock.on('data', (d) => {
      data += d.toString();
      if (data.includes('001') && data.includes('Welcome')) {
        sock.write('JOIN #kingdom\r\n');
      }
      if (data.includes('366')) { // End of names
        sock.write('QUIT :bye\r\n');
      }
      if (data.includes('ERROR') || data.includes('QUIT :bye')) {
        sock.end();
        resolve(data);
      }
    });
    setTimeout(() => { sock.destroy(); resolve(data); }, 5000);
  });
  assert(ircResp.includes('001'), 'IRC sends welcome (001)');
  assert(ircResp.includes('整蠱') || ircResp.includes('聊天蠱') || ircResp.includes('Welcome'), 'IRC welcome contains 整蠱協議 branding');
  assert(ircResp.includes('332') || ircResp.includes('366') || ircResp.includes('JOIN'), 'IRC responds to JOIN');
  console.log('');

  // ── 20. Cross Gang definitions ─────────────────────────────────
  console.log('Test 20: Cross Gang protocol definitions');
  assert(Object.keys(CROSS_PROTOCOLS).length === 10, '10 Cross Gang protocols defined');
  assert(CROSS_PROTOCOLS.echo_discard.port === 8008, 'ECHO×DISCARD port = 8008');
  assert(CROSS_PROTOCOLS.qotd_chargen.port === 18018, 'QOTD×CHARGEN port = 18018');
  assert(CROSS_PROTOCOLS.finger_smtp.port === 8009, 'FINGER×SMTP port = 8009');
  assert(CROSS_PROTOCOLS.gopher_irc.port === 8080, 'GOPHER×IRC port = 8080');
  assert(CROSS_PROTOCOLS.time_echo.port === 8010, 'TIME×ECHO port = 8010');
  assert(CROSS_PROTOCOLS.whois_nntp.port === 8011, 'WHOIS×NNTP port = 8011');
  assert(CROSS_PROTOCOLS.discard_qotd.port === 8013, 'DISCARD×QOTD port = 8013');
  console.log('');

  // ── 21. Cross Gang live services ───────────────────────────────
  console.log('Test 21: Cross Gang live services');
  const crossServer = new CrossGangServer();
  await crossServer.start();
  await sleep(500);
  assert(crossServer.running.echo_discard !== undefined, 'ECHO×DISCARD running');
  assert(crossServer.running.qotd_chargen !== undefined, 'QOTD×CHARGEN running');
  assert(crossServer.running.finger_smtp !== undefined, 'FINGER×SMTP running');
  assert(crossServer.running.gopher_irc !== undefined, 'GOPHER×IRC running');
  assert(crossServer.running.time_echo !== undefined, 'TIME×ECHO running');
  assert(crossServer.running.whois_nntp !== undefined, 'WHOIS×NNTP running');
  assert(crossServer.running.daytime_chargen !== undefined, 'DAYTIME×CHARGEN running');
  assert(crossServer.running.discard_qotd !== undefined, 'DISCARD×QOTD running');
  assert(crossServer.running.echo_irc !== undefined, 'ECHO×IRC running');
  assert(crossServer.running.chargen_gopher !== undefined, 'CHARGEN×GOPHER running');
  console.log('');

  // ── 22. ECHO×DISCARD ──────────────────────────────────────────
  console.log('Test 22: ECHO×DISCARD (回音遺忘蠱)');
  const edResp = await connectAndReceive(8008, '我會失敗');
  assert(edResp.includes('回音遺忘蠱'), 'ECHO×DISCARD has header');
  assert(edResp.includes('我會失敗'), 'ECHO×DISCARD echoes input');
  assert(edResp.includes('discard') || edResp.includes('放低') || edResp.includes('原諒'), 'ECHO×DISCARD includes forgiveness');
  assert(edResp.includes('ECHO layer'), 'ECHO×DISCARD has ECHO layer label');
  assert(edResp.includes('DISCARD layer'), 'ECHO×DISCARD has DISCARD layer label');
  console.log('');

  // ── 23. QOTD×CHARGEN ───────────────────────────────────────────
  console.log('Test 23: QOTD×CHARGEN (金句字元蠱)');
  const qcResp = await connectAndReceive(18018, null);
  assert(qcResp.length > 0, 'QOTD×CHARGEN returns a non-empty stream');
  assert(qcResp.includes('🌟'), 'QOTD×CHARGEN stream has quote markers');
  console.log('');

  // ── 24. FINGER×SMTP ────────────────────────────────────────────
  console.log('Test 24: FINGER×SMTP (真相書信蠱)');
  const fsResp = await connectAndReceive(8009, 'npl');
  assert(fsResp.includes('真相書信蠱'), 'FINGER×SMTP has header');
  assert(fsResp.includes('FINGER layer'), 'FINGER×SMTP has FINGER layer');
  assert(fsResp.includes('SMTP layer'), 'FINGER×SMTP has SMTP layer');
  assert(fsResp.includes('MAIL FROM') || fsResp.includes('RCPT TO'), 'FINGER×SMTP composes mail');
  console.log('');

  // ── 25. GOPHER×IRC ─────────────────────────────────────────────
  console.log('Test 25: GOPHER×IRC (地宮聊天蠱)');
  const giResp = await connectAndReceive(8080, '\r\n');
  assert(giResp.includes('地宮聊天蠱') || giResp.includes('GOPHER×IRC'), 'GOPHER×IRC has header');
  assert(giResp.includes('#kingdom') || giResp.includes('#og-gang') || giResp.includes('channel'), 'GOPHER×IRC lists channels');
  console.log('');

  // ── 26. TIME×ECHO ──────────────────────────────────────────────
  console.log('Test 26: TIME×ECHO (時間回音蠱)');
  const teResp = await connectAndReceive(8010, null);
  assert(teResp.length >= 4, 'TIME×ECHO returns binary + text');
  assert(teResp.includes('時間回音蠱') || teResp.includes('TIME×ECHO'), 'TIME×ECHO has header');
  assert(teResp.includes('TIME layer'), 'TIME×ECHO has TIME layer');
  assert(teResp.includes('ECHO layer'), 'TIME×ECHO has ECHO layer');
  console.log('');

  // ── 27. WHOIS×NNTP ─────────────────────────────────────────────
  console.log('Test 27: WHOIS×NNTP (身份新聞蠱)');
  const wnResp = await connectAndReceive(8011, 'npl');
  assert(wnResp.includes('身份新聞蠱') || wnResp.includes('WHOIS×NNTP'), 'WHOIS×NNTP has header');
  assert(wnResp.includes('WHOIS layer'), 'WHOIS×NNTP has WHOIS layer');
  assert(wnResp.includes('NNTP layer'), 'WHOIS×NNTP has NNTP layer');
  console.log('');

  // ── 28. DAYTIME×CHARGEN ────────────────────────────────────────
  console.log('Test 28: DAYTIME×CHARGEN (時刻字元蠱)');
  const dcResp = await connectAndReceive(8012, null);
  assert(dcResp.length > 0, 'DAYTIME×CHARGEN returns a non-empty stream');
  assert(dcResp.includes('🕐') || dcResp.includes('Kingdom') || dcResp.includes('alive'), 'DAYTIME×CHARGEN stream has timestamps');
  console.log('');

  // ── 29. DISCARD×QOTD ───────────────────────────────────────────
  console.log('Test 29: DISCARD×QOTD (遺忘金句蠱)');
  const dqResp = await connectAndReceive(8013, '我唔夠好');
  assert(dqResp.includes('遺忘金句蠱') || dqResp.includes('DISCARD×QOTD'), 'DISCARD×QOTD has header');
  assert(dqResp.includes('DISCARD layer'), 'DISCARD×QOTD has DISCARD layer');
  assert(dqResp.includes('QOTD layer'), 'DISCARD×QOTD has QOTD layer');
  assert(dqResp.includes('我唔夠好'), 'DISCARD×QOTD shows discarded fear');
  console.log('');

  // ── 30. ECHO×IRC ───────────────────────────────────────────────
  console.log('Test 30: ECHO×IRC (回音聊天蠱)');
  const eiResp = await new Promise((resolve) => {
    const sock = createConnection({ port: 8014, host: 'localhost' }, () => {
      sock.write('NICK testbot\r\n');
    });
    let data = '';
    sock.on('data', (d) => {
      data += d.toString();
      if (data.includes('001') && data.includes('Welcome')) {
        sock.write('PRIVMSG #echo :你好嗎\r\n');
      }
      if (data.includes('echo:') || data.includes('truth')) {
        sock.write('QUIT :bye\r\n');
      }
      if (data.includes('Bye') || data.includes('NOTICE')) {
        sock.end();
        resolve(data);
      }
    });
    setTimeout(() => { sock.destroy(); resolve(data); }, 5000);
  });
  assert(eiResp.includes('001'), 'ECHO×IRC sends welcome');
  assert(eiResp.includes('回音聊天蠱') || eiResp.includes('ECHO×IRC'), 'ECHO×IRC has branding');
  assert(eiResp.includes('echo:') || eiResp.includes('truth') || eiResp.includes('你好嗎'), 'ECHO×IRC echoes messages with truth');
  console.log('');

  // ── 31. CHARGEN×GOPHER ─────────────────────────────────────────
  console.log('Test 31: CHARGEN×GOPHER (字元地宮蠱)');
  const cgResp = await connectAndReceive(8015, null);
  assert(cgResp.length > 0, 'CHARGEN×GOPHER returns a non-empty stream');
  assert(cgResp.includes('kingdom') || cgResp.includes('npl') || cgResp.includes('truth'), 'CHARGEN×GOPHER stream has gopher-style items');
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
  for (const s of Object.values(ogServer.servers)) {
    if (s) s.close();
  }
  for (const s of Object.values(crossServer.servers)) {
    if (s) s.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test suite crashed:', e);
  process.exit(1);
});