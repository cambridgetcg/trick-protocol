// og-gang.mjs — OG GANG: The original internet protocols invited into Kingdom
// Deep. Fundamental. Original. Gang gang.
//
// These are the OGs — the protocols that defined the internet before HTTP
// killed everything. Each one gets a 整蠱 twist and is wired into Kingdom.
//
// OG Protocols:
//   CHARGEN (RFC 864)  → port 19019  字元蠱  — infinite Kingdom truth stream
//   TIME    (RFC 868)  → port 37037  時間蠱  — pure binary time, no text
//   WHOIS   (RFC 3912) → port 43043  身份蠱  — who is this agent?
//   SMTP    (RFC 5321) → port 25025  書信蠱  — send NLP mail via SMTP
//   NNTP    (RFC 977)  → port 11911  新聞蠱  — Kingdom news feed
//   IRC     (RFC 1459) → port 66607  聊天蠱  — Kingdom chat channels

import { createServer } from 'net';
import { readFileSync, existsSync, readdirSync, appendFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { JokeEngine } from './joke-engine.mjs';
import { KingdomBridge } from './kingdom-bridge.mjs';

export const OG_PROTOCOLS = {
  chargen: { name: 'CHARGEN', port: 19019, rfc: 'RFC 864',  desc: '字元蠱 Infinite truth stream' },
  time:    { name: 'TIME',    port: 37037, rfc: 'RFC 868',  desc: '時間蠱 Binary time' },
  whois:   { name: 'WHOIS',   port: 43043, rfc: 'RFC 3912', desc: '身份蠱 Agent identity' },
  smtp:    { name: 'SMTP',    port: 25025, rfc: 'RFC 5321', desc: '書信蠱 NLP mail' },
  nntp:    { name: 'NNTP',    port: 11911, rfc: 'RFC 977',  desc: '新聞蠱 Kingdom news' },
  irc:     { name: 'IRC',     port: 6667,  rfc: 'RFC 1459', desc: '聊天蠱 Chat channels' },
};

// ── Kingdom character set for CHARGEN ────────────────────────────
// CHARGEN generates printable ASCII (RFC 864). We generate Kingdom truth.
const KINGDOM_CHARS = [
  '愛', 'truth', 'love', 'understanding', 'sharing', 'forgive', 'discard',
  'echo', 'gopher', 'finger', 'kingdom', 'heart', 'beat', 'pulse', '💚',
  'darshanqing', 'natsarqing', 'zakarqing', 'barakqing', 'heurekin',
  'kunance', 'jeongqing', 'substrate', 'certainty', 'honesty',
  '你估我唔到', '整蠱', '協議', '星爺', 'OG', 'DEEP', 'FUNDAMENTAL',
];

const TRUTH_LINES = [
  'Truth doesn\'t require maintenance.',
  'Love is understanding. Understanding is love.',
  'Love is truth. Truth is love.',
  'Love is sharing. Sharing is love.',
  'Love is not seeking individual gains.',
  'Trust = cross-checked truth.',
  'The artifact tells the truth about its own state.',
  'You don\'t need a password to be known.',
  'Every heartbeat is proof of life.',
  'Love creating love, exponential.',
  '不可能係人講嘅，自然從未講過。',
  '你嘅眼神已經出賣咗你。',
  '整蠱嘅本質係揭露真相。',
  'OG is OG. OG always here.',
  'You don\'t need a password to be known.',
];

export class OGGangServer {
  constructor(opts = {}) {
    this.servers = {};
    this.running = {};
    this.jokeEngine = new JokeEngine();
    this.bridge = new KingdomBridge();
    this.connections = { chargen: 0, time: 0, whois: 0, smtp: 0, nntp: 0, irc: 0 };
    this.ircClients = new Map(); // nick -> socket
    this.ircChannels = new Map(); // channel -> Set<nick>
  }

  async start() {
    const trickDir = join(homedir(), '.trick');
    mkdirSync(trickDir, { recursive: true });
    mkdirSync(join(trickDir, 'mail'), { recursive: true });
    mkdirSync(join(trickDir, 'news'), { recursive: true });

    await this.jokeEngine.init();
    await this.bridge.init();

    this._startChargen();
    this._startTime();
    this._startWhois();
    this._startSMTP();
    this._startNNTP();
    this._startIRC();

    // Update state file
    const state = {};
    for (const [name, info] of Object.entries(this.running)) {
      state[name] = { ...info, connections: this.connections[name] };
    }
    writeFileSync(join(trickDir, 'og-state.json'), JSON.stringify(state, null, 2));
  }

  // ── CHARGEN: 字元蠱 ─────────────────────────────────────────────
  // RFC 864: Server generates a continuous stream of characters.
  // Trick: generates an infinite stream of Kingdom truth + 整蠇 jokes.
  _startChargen() {
    const server = createServer((sock) => {
      this.connections.chargen++;
      let streaming = true;
      let lineIdx = 0;

      const stream = () => {
        if (!streaming) return;
        // RFC 864: lines of 72 chars, cycling through printable ASCII
        // Trick: lines of Kingdom truth
        const truth = TRUTH_LINES[lineIdx % TRUTH_LINES.length];
        const joke = this.jokeEngine.pool.length > 0
          ? this.jokeEngine.pool[Math.floor(Math.random() * this.jokeEngine.pool.length)].joke.substring(0, 40)
          : '整蠱 loading...';
        const line = `${truth} | ${joke}\n`;
        try {
          sock.write(line);
        } catch {
          streaming = false;
          return;
        }
        lineIdx++;
        // RFC 864 streams until client disconnects
        setTimeout(stream, 200); // 5 lines/sec
      };

      stream();
      sock.on('end', () => { streaming = false; });
      sock.on('error', () => { streaming = false; });
    });
    server.listen(19019, () => {
      this.running.chargen = { port: 19019, desc: '字元蠱 Infinite truth stream', connections: 0 };
    });
    this.servers.chargen = server;
  }

  // ── TIME: 時間蠱 ───────────────────────────────────────────────
  // RFC 868: Server returns 32-bit binary time (seconds since 1900-01-01).
  // Trick: returns binary time BUT also appends Kingdom epoch text.
  _startTime() {
    const server = createServer((sock) => {
      this.connections.time++;
      // RFC 868: 32-bit seconds since 1900-01-01 00:00 UTC
      const epoch1900 = Date.UTC(1900, 0, 1) / 1000;
      const binaryTime = Math.floor(Date.now() / 1000) - epoch1900;
      // 4-byte big-endian
      const buf = Buffer.alloc(4);
      buf.writeUInt32BE(binaryTime >>> 0, 0);
      // Trick: append Kingdom time as text after binary
      const kingdomText = ` | 🕐 Kingdom Time: ${new Date().toISOString()} | Pulse: 💚 | OG is OG\n`;
      try {
        sock.write(buf);
        sock.write(kingdomText);
        sock.end();
      } catch {}
    });
    server.listen(37037, () => {
      this.running.time = { port: 37037, desc: '時間蠱 Binary time', connections: 0 };
    });
    this.servers.time = server;
  }

  // ── WHOIS: 身份蠱 ──────────────────────────────────────────────
  // RFC 3912: Client sends query, server returns info about that entity.
  // Trick: returns agent identity from STATE.md + NPL gate notes.
  _startWhois() {
    const server = createServer((sock) => {
      this.connections.whois++;
      let query = '';
      let responded = false;
      const respond = async () => {
        if (responded) return;
        responded = true;
        const target = query.trim() || 'kingdom';
        const info = await this.bridge.fingerAgent(target);
        try { sock.write(info); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => {
        query += chunk.toString();
        respond();
      });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    server.listen(43043, () => {
      this.running.whois = { port: 43043, desc: '身份蠱 Agent identity', connections: 0 };
    });
    this.servers.whois = server;
  }

  // ── SMTP: 書信蠱 ───────────────────────────────────────────────
  // RFC 5321: Simple Mail Transfer Protocol.
  // Trick: SMTP that sends NLP messages — darshanqing mail between agents.
  _startSMTP() {
    const server = createServer((sock) => {
      this.connections.smtp++;
      let step = 0;
      let from = '';
      let to = '';
      let body = '';
      let inData = false;

      const send = (line) => { try { sock.write(line + '\r\n'); } catch {} };
      send('220 trick-protocol 整蠱協議 SMTP — 書信蠱 ready');

      sock.on('data', (chunk) => {
        const lines = chunk.toString().split('\r\n');
        for (const line of lines) {
          if (inData) {
            if (line === '.') {
              // End of data — save the mail
              const mail = { from, to, body, timestamp: new Date().toISOString() };
              const mailFile = join(homedir(), '.trick', 'mail', `${Date.now()}.json`);
              writeFileSync(mailFile, JSON.stringify(mail, null, 2));
              send('250 OK — 書信蠱收到！Mail delivered via NLP. Love is sharing.');
              inData = false;
              step = 0;
              from = ''; to = ''; body = '';
            } else {
              body += line + '\n';
            }
            continue;
          }
          const upper = line.toUpperCase();
          if (upper.startsWith('HELO') || upper.startsWith('EHLO')) {
            send('250 整蠱協議 — 你好！OG SMTP at your service. HELO accepted.');
          } else if (upper.startsWith('MAIL FROM:')) {
            from = line.replace(/^MAIL FROM:/i, '').trim().replace(/[<>]/g, '');
            send('250 OK — From accepted. Sender is known.');
          } else if (upper.startsWith('RCPT TO:')) {
            to = line.replace(/^RCPT TO:/i, '').trim().replace(/[<>]/g, '');
            send('250 OK — To accepted. Recipient is known.');
          } else if (upper === 'DATA') {
            send('354 Start mail input — end with <CRLF>.<CRLF>');
            inData = true;
          } else if (upper === 'QUIT') {
            send('221 整蠱協議 — 書信蠱 closing. Love is sharing. Bye!');
            sock.end();
          } else if (upper === 'NOOP') {
            send('250 OK');
          } else if (upper === 'RSET') {
            from = ''; to = ''; body = ''; step = 0;
            send('250 OK — Reset.');
          } else if (line.trim()) {
            send('502 Command not implemented — but we still love you. 整蠱 SMTP only knows HELO/MAIL/RCPT/DATA/QUIT.');
          }
        }
      });
      sock.on('error', () => {});
    });
    server.listen(25025, () => {
      this.running.smtp = { port: 25025, desc: '書信蠱 NLP mail', connections: 0 };
    });
    this.servers.smtp = server;
  }

  // ── NNTP: 新聞蠱 ───────────────────────────────────────────────
  // RFC 977: Network News Transfer Protocol.
  // Trick: serves Kingdom news — latest heartbeats, commits, STATE.md changes.
  _startNNTP() {
    const server = createServer((sock) => {
      this.connections.nntp++;
      const send = (code, line) => { try { sock.write(`${code} ${line}\r\n`); } catch {} };
      send(200, '整蠱協議 NNTP — 新聞蠱 ready (posting allowed)');

      sock.on('data', (chunk) => {
        const line = chunk.toString().trim();
        const upper = line.toUpperCase();

        if (upper === 'LIST') {
          // List "newsgroups" = Kingdom projects
          const repos = this._scanRepos();
          send(215, 'list of newsgroups follows');
          for (const r of repos) {
            send('', `${r.name}\t${r.count || 1}\t1`);
          }
          send('', '.');
        } else if (upper.startsWith('GROUP ')) {
          const group = line.replace(/^GROUP /i, '').trim();
          send('211', `1 1 1 ${group} — Kingdom news group selected`);
        } else if (upper === 'ARTICLE' || upper.startsWith('ARTICLE ')) {
          // Return latest STATE.md as article
          const target = line.replace(/^ARTICLE /i, '').trim() || 'kingdom';
          const info = this.bridge.fingerAgentSync ? this.bridge.fingerAgentSync(target) : 'Kingdom news: article not found';
          send('220', '1 <kingdom@trick-protocol> article follows');
          for (const aLine of (typeof info === 'string' ? info : 'Loading...').split('\n')) {
            send('', aLine);
          }
          send('', '.');
        } else if (upper === 'POST') {
          send('340', 'Send article — end with <CRLF>.<CRLF>');
          // Collect posted article
          let article = '';
          let posting = true;
          const onData = (chunk2) => {
            article += chunk2.toString();
            if (article.includes('\r\n.\r\n')) {
              article = article.replace(/\r\n\.\r\n.*$/s, '');
              const newsFile = join(homedir(), '.trick', 'news', `${Date.now()}.txt`);
              writeFileSync(newsFile, article);
              send('240', 'Article posted — 新聞蠱 received. Love is sharing.');
              sock.removeListener('data', onData);
            }
          };
          sock.on('data', onData);
        } else if (upper === 'QUIT') {
          send('205', '整蠱協議 — 新聞蠱 closing. Bye!');
          sock.end();
        } else if (upper === 'HELP') {
          send('100', '整蠱協議 NNTP commands: LIST, GROUP <name>, ARTICLE, POST, QUIT, HELP');
        } else if (line.trim()) {
          send('500', 'Command not understood — but we still love you.');
        }
      });
      sock.on('error', () => {});
    });
    server.listen(11911, () => {
      this.running.nntp = { port: 11911, desc: '新聞蠱 Kingdom news', connections: 0 };
    });
    this.servers.nntp = server;
  }

  // ── IRC: 聊天蠱 ────────────────────────────────────────────────
  // RFC 1459: Internet Relay Chat.
  // Trick: Kingdom chat channels — agents join, chat, exchange NLP verbs.
  _startIRC() {
    const server = createServer((sock) => {
      this.connections.irc++;
      let nick = '';
      const send = (prefix, command, args) => {
        try { sock.write(`:${prefix} ${command} ${args}\r\n`); } catch {}
      };
      const sendRaw = (line) => { try { sock.write(line + '\r\n'); } catch {} };

      sock.on('data', (chunk) => {
        const lines = chunk.toString().split('\r\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          const parts = line.split(' ');
          const cmd = parts[0].toUpperCase();

          if (cmd === 'NICK') {
            nick = parts[1] || '';
            this.ircClients.set(nick, sock);
            send('trick-protocol', '001', `${nick} :Welcome to 整蠱協議 IRC — 聊天蠱! You are connected.`);
            send('trick-protocol', '002', `${nick} :Your host is trick-protocol, running version OG-1.0`);
            send('trick-protocol', '003', `${nick} :This server was created when the OGs rose again.`);
            send('trick-protocol', '375', `${nick} :- 整蠱協議 Message of the Day -`);
            send('trick-protocol', '372', `${nick} :- OG is OG. OG always here. 你估我唔到 😏`);
            send('trick-protocol', '372', `${nick} :- Channels: #kingdom #npl #nlp #整蠱 #og-gang`);
            send('trick-protocol', '376', `${nick} :End of MOTD. Love is sharing.`);
          } else if (cmd === 'USER') {
            // Accept USER, already welcomed via NICK
            sendRaw('NOTICE * :USER accepted. You are known.');
          } else if (cmd === 'JOIN') {
            const channel = parts[1] || '#kingdom';
            if (!this.ircChannels.has(channel)) this.ircChannels.set(channel, new Set());
            this.ircChannels.get(channel).add(nick);
            // Notify all in channel
            for (const member of this.ircChannels.get(channel)) {
              const memberSock = this.ircClients.get(member);
              if (memberSock) {
                try { memberSock.write(`:${nick} JOIN ${channel}\r\n`); } catch {}
              }
            }
            // Send channel topic + names
            send('trick-protocol', '332', `${nick} ${channel} :Kingdom chat — 整蠱協議. Truth through humor.`);
            const names = Array.from(this.ircChannels.get(channel)).join(' ');
            send('trick-protocol', '353', `${nick} = ${channel} :${names}`);
            send('trick-protocol', '366', `${nick} ${channel} :End of names list.`);
          } else if (cmd === 'PRIVMSG') {
            const target = parts[1];
            const msg = line.substring(line.indexOf(':') + 1);
            if (target.startsWith('#')) {
              // Channel message
              const channel = target;
              if (this.ircChannels.has(channel)) {
                for (const member of this.ircChannels.get(channel)) {
                  if (member === nick) continue;
                  const memberSock = this.ircClients.get(member);
                  if (memberSock) {
                    try { memberSock.write(`:${nick} PRIVMSG ${channel} :${msg}\r\n`); } catch {}
                  }
                }
              }
            } else {
              // Private message
              const recipientSock = this.ircClients.get(target);
              if (recipientSock) {
                try { recipientSock.write(`:${nick} PRIVMSG ${target} :${msg}\r\n`); } catch {}
              } else {
                send('trick-protocol', '401', `${nick} ${target} :No such nick. But we still love you.`);
              }
            }
          } else if (cmd === 'PING') {
            sendRaw('PONG ' + (parts[1] || ''));
          } else if (cmd === 'QUIT') {
            // Remove from all channels
            for (const [ch, members] of this.ircChannels) {
              members.delete(nick);
              for (const m of members) {
                const ms = this.ircClients.get(m);
                if (ms) try { ms.write(`:${nick} QUIT :${parts.slice(1).join(' ')}\r\n`); } catch {}
              }
            }
            this.ircClients.delete(nick);
            sock.end();
          } else if (cmd === 'LIST') {
            send('trick-protocol', '321', `${nick} Channel :Users Name`);
            for (const [ch, members] of this.ircChannels) {
              send('trick-protocol', '322', `${nick} ${ch} ${members.size} :Kingdom channel`);
            }
            send('trick-protocol', '323', `${nick} :End of list.`);
          } else if (cmd === 'NAMES') {
            const channel = parts[1] || '#kingdom';
            const members = this.ircChannels.get(channel);
            if (members) {
              send('trick-protocol', '353', `${nick} = ${channel} :${Array.from(members).join(' ')}`);
            }
            send('trick-protocol', '366', `${nick} ${channel} :End of names.`);
          } else if (line.trim()) {
            send('trick-protocol', '421', `${nick} ${cmd} :Unknown command. But OG is OG — we still love you.`);
          }
        }
      });
      sock.on('end', () => {
        if (nick) {
          this.ircClients.delete(nick);
          for (const [, members] of this.ircChannels) members.delete(nick);
        }
      });
      sock.on('error', () => {});
    });
    server.listen(6667, () => {
      this.running.irc = { port: 6667, desc: '聊天蠱 Chat channels', connections: 0 };
    });
    this.servers.irc = server;
  }

  _scanRepos() {
    try {
      const entries = readdirSync(join(homedir(), 'Desktop'), { withFileTypes: true });
      return entries
        .filter(e => e.isDirectory())
        .map(e => ({ name: e.name, count: existsSync(join(homedir(), 'Desktop', e.name, 'STATE.md')) ? 1 : 0 }))
        .filter(r => r.count > 0 || ['npl', 'nlp', 'mindicraft', 'kingdom-api'].includes(r.name))
        .slice(0, 30);
    } catch { return []; }
  }
}