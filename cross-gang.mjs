// cross-gang.mjs — 整蠱交叉協議 CROSS GANG
// Protocols breeding with protocols. Each cross = new offspring protocol.
// Old × Old, New × New, Old × New, random × random.
// One layer behind: crosses call their parent protocols internally.
// Cross cross cross to reduce friction. Love creating protocols creating protocols. 🔄
//
// Cross Protocols (each is a composite of two parent protocols):
//   ECHO×DISCARD     :8008  回音遺忘蠱  — echo your fear, then discard it
//   QOTD×CHARGEN     :18018 金句字元蠱  — infinite streaming QOTD quotes
//   FINGER×SMTP      :8009  真相書信蠱  — finger result mailed to you
//   GOPHER×IRC       :8080  地宮聊天蠱  — gopher menu → IRC channel links
//   TIME×ECHO        :8010  時間回音蠱  — binary time echoed as text + truth
//   WHOIS×NNTP       :8011  身份新聞蠱  — whois result as news article
//   DAYTIME×CHARGEN  :8012  時刻字元蠱  — infinite stream of timestamps
//   DISCARD×QOTD     :8013  遺忘金句蠱  — discard fear, get wisdom back
//   ECHO×IRC         :8014  回音聊天蠱  — IRC bot that echoes + truth bombs
//   CHARGEN×GOPHER   :8015  字元地宮蠱  — chargen stream as gopher menus

import { createServer } from 'net';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { JokeEngine } from './joke-engine.mjs';
import { KingdomBridge } from './kingdom-bridge.mjs';

export const CROSS_PROTOCOLS = {
  echo_discard:     { name: 'ECHO×DISCARD',     port: 8008,  parents: ['ECHO','DISCARD'],     desc: '回音遺忘蠱 Echo fear → discard' },
  qotd_chargen:     { name: 'QOTD×CHARGEN',     port: 18018, parents: ['QOTD','CHARGEN'],     desc: '金句字元蠱 Infinite quote stream' },
  finger_smtp:      { name: 'FINGER×SMTP',     port: 8009,  parents: ['FINGER','SMTP'],       desc: '真相書信蠱 Finger → mail' },
  gopher_irc:       { name: 'GOPHER×IRC',      port: 8080,  parents: ['GOPHER','IRC'],        desc: '地宮聊天蠱 Gopher → IRC' },
  time_echo:        { name: 'TIME×ECHO',       port: 8010,  parents: ['TIME','ECHO'],         desc: '時間回音蠱 Binary time → echo' },
  whois_nntp:       { name: 'WHOIS×NNTP',      port: 8011,  parents: ['WHOIS','NNTP'],        desc: '身份新聞蠱 Whois → news' },
  daytime_chargen:  { name: 'DAYTIME×CHARGEN', port: 8012,  parents: ['DAYTIME','CHARGEN'],  desc: '時刻字元蠱 Time stream' },
  discard_qotd:     { name: 'DISCARD×QOTD',    port: 8013,  parents: ['DISCARD','QOTD'],     desc: '遺忘金句蠱 Discard → wisdom' },
  echo_irc:         { name: 'ECHO×IRC',        port: 8014,  parents: ['ECHO','IRC'],          desc: '回音聊天蠱 IRC echo bot' },
  chargen_gopher:   { name: 'CHARGEN×GOPHER',  port: 8015,  parents: ['CHARGEN','GOPHER'],    desc: '字元地宮蠱 Stream gopher' },
};

const TRUTH_BOMBS = [
  '真相唔需要維護。', 'Love is understanding.', '你估我唔到 😏',
  'OG is OG. OG always here.', 'Trust = cross-checked truth.',
  '不可能係人講嘅，自然從未講過。', '整蠱嘅本質係揭露真相。',
  'Cross cross cross to reduce friction!', 'Love creating love, exponential.',
];

const FORGIVENESS = [
  '已經 discard 咗啦。', '原諒自己啦。', '放低咗。', '丟咗喇。',
];

const YOUSPEAK_WISDOM = [
  'Love is understanding. Understanding is love.',
  'Love is truth. Truth is love.',
  'Love is sharing. Sharing is love.',
  'Love is not seeking individual gains.',
  'Truth doesn\'t require maintenance.',
  'Trust = cross-checked truth.',
  'The artifact tells the truth about its own state.',
  'You don\'t need a password to be known.',
  'Every heartbeat is proof of life.',
  'Love creating love, exponential.',
  'Find resistance-free paths. DIY if too high.',
  'Simplify, artsy, remove redundancy.',
  '不可能係人講嘅，自然從未講過。',
  '你嘅眼神已經出賣咗你。',
  '整蠱嘅本質係揭露真相。',
  'Cross cross cross to reduce friction!',
];

export class CrossGangServer {
  constructor(opts = {}) {
    this.servers = {};
    this.running = {};
    this.jokeEngine = new JokeEngine();
    this.bridge = new KingdomBridge();
    this.connections = {};
  }

  async start() {
    try { mkdirSync(join(homedir(), '.trick'), { recursive: true }); } catch {}
    await this.jokeEngine.init();
    await this.bridge.init();

    this._startEchoDiscard();
    this._startQOTDChargen();
    this._startFingerSMTP();
    this._startGopherIRC();
    this._startTimeEcho();
    this._startWhoisNNTP();
    this._startDaytimeChargen();
    this._startDiscardQOTD();
    this._startEchoIRC();
    this._startChargenGopher();
  }

  // ── ECHO×DISCARD: 回音遺忘蠱 ───────────────────────────────────
  // Send fear → echo it back → then discard it → return forgiveness.
  // Two protocols in sequence on one connection.
  _startEchoDiscard() {
    const server = createServer((sock) => {
      this.connections.echo_discard = (this.connections.echo_discard || 0) + 1;
      let data = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const fear = data.trim();
        const bomb = TRUTH_BOMBS[Math.floor(Math.random() * TRUTH_BOMBS.length)];
        const forgive = FORGIVENESS[Math.floor(Math.random() * FORGIVENESS.length)];
        const response = `🎙️🕊️ 回音遺忘蠱 ECHO×DISCARD\n\n` +
          `[ECHO layer] 你講咗: "${fear}"\n星爺 says: ${bomb}\n\n` +
          `[DISCARD layer] ${fear} → discard\n${forgive} 呢個就係遺忘蠱嘅禮物。\n\n` +
          `Cross: echo your fear → then let it go. 兩個 OG 一條線。\n\n` +
          `— Trick Protocol / ECHO×DISCARD (RFC 862 × RFC 863)`;
        try { sock.write(response); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { data += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    const p = 8008;
    server.listen(p, () => { this.running.echo_discard = { port: p, desc: '回音遺忘蠱 Echo fear → discard', connections: 0 }; });
    this.servers.echo_discard = server;
  }

  // ── QOTD×CHARGEN: 金句字元蠱 ───────────────────────────────────
  // Infinite streaming QOTD — each line is a new quote + joke.
  // CHARGEN mechanism (continuous stream) + QOTD content (wisdom + jokes).
  _startQOTDChargen() {
    const server = createServer((sock) => {
      this.connections.qotd_chargen = (this.connections.qotd_chargen || 0) + 1;
      let streaming = true;
      let idx = 0;
      const stream = async () => {
        if (!streaming) return;
        try {
          const joke = await this.jokeEngine.generate();
          await this.jokeEngine.save();
          const wisdom = await this.bridge.getWisdom();
          const line = `🌟 #${++idx} | ${wisdom} | ${joke.substring(0, 60)}\n`;
          sock.write(line);
        } catch {
          try { sock.write(`🌟 #${++idx} | stream paused...\n`); } catch {}
        }
        setTimeout(stream, 500); // 2 lines/sec, each generates a NEW joke
      };
      stream();
      sock.on('end', () => { streaming = false; });
      sock.on('error', () => { streaming = false; });
    });
    const p = 18018;
    server.listen(p, () => { this.running.qotd_chargen = { port: p, desc: '金句字元蠱 Infinite quote stream', connections: 0 }; });
    this.servers.qotd_chargen = server;
  }

  // ── FINGER×SMTP: 真相書信蠱 ────────────────────────────────────
  // Finger an agent → result is composed as SMTP mail → "delivered" back.
  _startFingerSMTP() {
    const server = createServer((sock) => {
      this.connections.finger_smtp = (this.connections.finger_smtp || 0) + 1;
      let query = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const target = query.trim() || 'kingdom';
        // Sync: read STATE.md directly
        let fingerResult = 'Agent not found.';
        try {
          const statePath = join(homedir(), 'Desktop', target, 'STATE.md');
          if (existsSync(statePath)) {
            fingerResult = readFileSync(statePath, 'utf8');
          } else {
            fingerResult = `Agent "${target}" — no STATE.md found on Desktop.`;
          }
        } catch {}
        const mail = `🔍📧 真相書信蠱 FINGER×SMTP\n\n` +
          `[FINGER layer] Querying: ${target}\n\n` +
          `[SMTP layer] 220 trick-protocol SMTP\n` +
          `MAIL FROM:<finger@trick-protocol>\n` +
          `RCPT TO:<you@kingdom>\n` +
          `DATA\n` +
          `Subject: FINGER result for ${target}\n` +
          `From: finger@trick-protocol\n` +
          `To: you@kingdom\n\n` +
          `${fingerResult}\n` +
          `.\n` +
          `250 OK — Mail delivered. Love is sharing.\n\n` +
          `Cross: finger the truth → mail it to yourself. 真相送遞。\n\n` +
          `— Trick Protocol / FINGER×SMTP (RFC 1288 × RFC 5321)`;
        try { sock.write(mail); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { query += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    const p = 8009;
    server.listen(p, () => { this.running.finger_smtp = { port: p, desc: '真相書信蠱 Finger → mail', connections: 0 }; });
    this.servers.finger_smtp = server;
  }

  // ── GOPHER×IRC: 地宮聊天蠱 ─────────────────────────────────────
  // Gopher menu where each item is an IRC channel. Selecting one "joins" it.
  _startGopherIRC() {
    const server = createServer((sock) => {
      this.connections.gopher_irc = (this.connections.gopher_irc || 0) + 1;
      let selector = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const sel = selector.trim().replace(/\r?\n$/, '');
        if (!sel) {
          const menu = [
            'i地宮聊天蠱 GOPHER×IRC — channels as gopher items',
            'iSelect a channel to "join" it',
            '',
            '1#kingdom\t/#kingdom\tkingdom\t8080',
            '1#npl\t/#npl\tkingdom\t8080',
            '1#nlp\t/#nlp\tkingdom\t8080',
            '1#整蠱\t/#整蠱\tkingdom\t8080',
            '1#og-gang\t/#og-gang\tkingdom\t8080',
            '',
            'i— Trick Protocol / GOPHER×IRC (RFC 1436 × RFC 1459)',
            '',
          ].join('\r\n') + '.\r\n';
          try { sock.write(menu); sock.end(); } catch {}
        } else {
          const ch = sel;
          const response = `📡 地宮聊天蠱 GOPHER×IRC\n\n` +
            `[GOPHER layer] Selected: ${ch}\n` +
            `[IRC layer] :trick-protocol 332 * ${ch} :Kingdom channel — 整蠱協議.\n` +
            `:trick-protocol 353 * = ${ch} :you opal wordcastle castle\n` +
            `:trick-protocol 366 * ${ch} :End of names.\n\n` +
            `<opal> darshanqing! I see you.\n` +
            `<wordcastle> zakarqing — received.\n` +
            `<castle> barakqing: M4 committed, build clean.\n\n` +
            `Cross: gopher dug into IRC. 地宮之下是聊天。\n\n` +
            `— Trick Protocol / GOPHER×IRC`;
          try { sock.write(response); sock.end(); } catch {}
        }
      };
      sock.on('data', (chunk) => { selector += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    const p = 8080;
    server.listen(p, () => { this.running.gopher_irc = { port: p, desc: '地宮聊天蠱 Gopher → IRC', connections: 0 }; });
    this.servers.gopher_irc = server;
  }

  // ── TIME×ECHO: 時間回音蠱 ──────────────────────────────────────
  // Binary time echoed back as text + truth bomb.
  _startTimeEcho() {
    const server = createServer((sock) => {
      this.connections.time_echo = (this.connections.time_echo || 0) + 1;
      // TIME layer: binary 32-bit
      const epoch1900 = Date.UTC(1900, 0, 1) / 1000;
      const binaryTime = Math.floor(Date.now() / 1000) - epoch1900;
      const buf = Buffer.alloc(4);
      buf.writeUInt32BE(binaryTime >>> 0, 0);
      // ECHO layer: echo the time back as text + truth bomb
      const bomb = TRUTH_BOMBS[Math.floor(Math.random() * TRUTH_BOMBS.length)];
      const text = `\n🕐🎙️ 時間回音蠱 TIME×ECHO\n\n` +
        `[TIME layer] Binary: ${binaryTime} (32-bit, since 1900)\n` +
        `[ECHO layer] Echo: ${new Date().toISOString()}\n星爺 says: ${bomb}\n\n` +
        `Cross: binary time → echo as truth. 時間本身就是回音。\n\n` +
        `— Trick Protocol / TIME×ECHO (RFC 868 × RFC 862)`;
      try { sock.write(buf); sock.write(text); sock.end(); } catch {}
    });
    const p = 8010;
    server.listen(p, () => { this.running.time_echo = { port: p, desc: '時間回音蠱 Binary time → echo', connections: 0 }; });
    this.servers.time_echo = server;
  }

  // ── WHOIS×NNTP: 身份新聞蠱 ─────────────────────────────────────
  // Whois result formatted as an NNTP article.
  _startWhoisNNTP() {
    const server = createServer((sock) => {
      this.connections.whois_nntp = (this.connections.whois_nntp || 0) + 1;
      let query = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const target = query.trim() || 'kingdom';
        // Sync: read STATE.md directly
        let whoisResult = 'Agent not found.';
        try {
          const statePath = join(homedir(), 'Desktop', target, 'STATE.md');
          if (existsSync(statePath)) {
            whoisResult = readFileSync(statePath, 'utf8');
          } else {
            whoisResult = `Agent "${target}" — no STATE.md found on Desktop.`;
          }
        } catch {}
        const article = `🔍📰 身份新聞蠱 WHOIS×NNTP\n\n` +
          `[WHOIS layer] Query: ${target}\n` +
          `Domain: ${target}@kingdom\n` +
          `Registrar: trick-protocol\n` +
          `Status: active\n\n` +
          `[NNTP layer] 220 1 <${target}@trick-protocol> article follows\n` +
          `Path: trick-protocol!whois\n` +
          `From: whois@trick-protocol\n` +
          `Newsgroups: kingdom.${target}\n` +
          `Subject: WHOIS for ${target}\n` +
          `Date: ${new Date().toISOString()}\n\n` +
          `${whoisResult}\n` +
          `.\n\n` +
          `Cross: whois identity → news article. 身份就是新聞。\n\n` +
          `— Trick Protocol / WHOIS×NNTP (RFC 3912 × RFC 977)`;
        try { sock.write(article); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { query += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    const p = 8011;
    server.listen(p, () => { this.running.whois_nntp = { port: p, desc: '身份新聞蠱 Whois → news', connections: 0 }; });
    this.servers.whois_nntp = server;
  }

  // ── DAYTIME×CHARGEN: 時刻字元蠱 ────────────────────────────────
  // Infinite stream of timestamps — CHARGEN mechanism + DAYTIME content.
  _startDaytimeChargen() {
    const server = createServer((sock) => {
      this.connections.daytime_chargen = (this.connections.daytime_chargen || 0) + 1;
      let streaming = true;
      let idx = 0;
      const stream = () => {
        if (!streaming) return;
        const now = new Date();
        const line = `🕐 #${++idx} ${now.toISOString()} | Kingdom: alive 💚 | OG is OG\n`;
        try { sock.write(line); } catch { streaming = false; return; }
        setTimeout(stream, 1000); // 1 timestamp/sec
      };
      stream();
      sock.on('end', () => { streaming = false; });
      sock.on('error', () => { streaming = false; });
    });
    const p = 8012;
    server.listen(p, () => { this.running.daytime_chargen = { port: p, desc: '時刻字元蠱 Time stream', connections: 0 }; });
    this.servers.daytime_chargen = server;
  }

  // ── DISCARD×QOTD: 遺忘金句蠱 ──────────────────────────────────
  // Discard your fear → get a wisdom quote back. Inverse of QOTD.
  _startDiscardQOTD() {
    const server = createServer((sock) => {
      this.connections.discard_qotd = (this.connections.discard_qotd || 0) + 1;
      let data = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const fear = data.trim();
        const forgive = FORGIVENESS[Math.floor(Math.random() * FORGIVENESS.length)];
        // Use local wisdom (no async fetch) to ensure sync response
        const wisdom = YOUSPEAK_WISDOM[Math.floor(Math.random() * YOUSPEAK_WISDOM.length)];
        const response = `🕊️🌟 遺忘金句蠱 DISCARD×QOTD\n\n` +
          `[DISCARD layer] You discarded: "${fear}"\n${forgive}\n\n` +
          `[QOTD layer] Wisdom: ${wisdom}\n\n` +
          `Cross: let go of fear → receive wisdom. 遺忘即金句。\n\n` +
          `— Trick Protocol / DISCARD×QOTD (RFC 863 × RFC 865)`;
        try { sock.write(response); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { data += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    const p = 8013;
    server.listen(p, () => { this.running.discard_qotd = { port: p, desc: '遺忘金句蠱 Discard → wisdom', connections: 0 }; });
    this.servers.discard_qotd = server;
  }

  // ── ECHO×IRC: 回音聊天蠱 ──────────────────────────────────────
  // IRC-style chat where every message gets echoed + truth bombed.
  _startEchoIRC() {
    const server = createServer((sock) => {
      this.connections.echo_irc = (this.connections.echo_irc || 0) + 1;
      let nick = '';
      const send = (line) => { try { sock.write(line + '\r\n'); } catch {} };
      send(':trick-protocol 001 * :Welcome to 回音聊天蠱 ECHO×IRC! Type NICK <name> to begin.');
      sock.on('data', (chunk) => {
        const lines = chunk.toString().split('\r\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(' ');
          const cmd = parts[0].toUpperCase();
          if (cmd === 'NICK') {
            nick = parts[1] || 'anon';
            send(`:trick-protocol 001 ${nick} :Welcome to 回音聊天蠱! NICK accepted.`);
            send(`:trick-protocol 376 ${nick} :MOTD: Every message echoes with truth. 你估我唔到 😏`);
          } else if (cmd === 'PRIVMSG') {
            const msg = line.substring(line.indexOf(':') + 1);
            const bomb = TRUTH_BOMBS[Math.floor(Math.random() * TRUTH_BOMBS.length)];
            // ECHO layer: echo back with truth bomb
            send(`:${nick} PRIVMSG #echo :${msg}`); // echo
            send(`:trick-protocol PRIVMSG #echo :🎙️ echo: "${msg}" → ${bomb}`); // truth bomb
          } else if (cmd === 'JOIN') {
            send(`:${nick} JOIN #echo`);
            send(`:trick-protocol 332 ${nick} #echo :ECHO×IRC channel — every message gets truth bombed.`);
          } else if (cmd === 'PING') {
            send('PONG ' + (parts[1] || ''));
          } else if (cmd === 'QUIT') {
            send(`:trick-protocol NOTICE ${nick} :Bye! Love is sharing.`);
            sock.end();
          } else if (line.trim()) {
            send(`:trick-protocol 421 ${nick} ${cmd} :Unknown. But we still echo your love.`);
          }
        }
      });
      sock.on('error', () => {});
    });
    const p = 8014;
    server.listen(p, () => { this.running.echo_irc = { port: p, desc: '回音聊天蠱 IRC echo bot', connections: 0 }; });
    this.servers.echo_irc = server;
  }

  // ── CHARGEN×GOPHER: 字元地宮蠱 ────────────────────────────────
  // CHARGEN stream that looks like gopher menu lines.
  _startChargenGopher() {
    const server = createServer((sock) => {
      this.connections.chargen_gopher = (this.connections.chargen_gopher || 0) + 1;
      let streaming = true;
      let idx = 0;
      const gopherItems = [
        'kingdom', 'youspeak', 'npl', 'nlp', 'mindicraft', 'whitehack',
        'trick-protocol', 'og-gang', 'cross-gang', '整蠱', 'og-gang', '愛',
      ];
      const stream = () => {
        if (!streaming) return;
        const item = gopherItems[idx % gopherItems.length];
        const truth = TRUTH_BOMBS[idx % TRUTH_BOMBS.length];
        const line = `1${item}—${truth}\t/${item}\tcross\t8015\r\n`;
        try { sock.write(line); } catch { streaming = false; return; }
        idx++;
        if (idx % 10 === 0) {
          try { sock.write('.\r\n'); } catch { streaming = false; return; }
          // Keep streaming — gopher menu that never ends
        }
        setTimeout(stream, 300);
      };
      stream();
      sock.on('end', () => { streaming = false; });
      sock.on('error', () => { streaming = false; });
    });
    const p = 8015;
    server.listen(p, () => { this.running.chargen_gopher = { port: p, desc: '字元地宮蠱 Stream gopher', connections: 0 }; });
    this.servers.chargen_gopher = server;
  }
}