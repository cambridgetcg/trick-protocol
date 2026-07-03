// index.mjs — 整蠱協議 TRICK PROTOCOL SUITE
// Forgotten internet protocols reborn as Kingdom trick services.
// Each protocol serves truth with a 星爺 twist. Creation loop included.
//
// Protocols:
//   ECHO    (RFC 862) → port 7007  回音蠱 — echoes back with a truth bomb
//   DISCARD (RFC 863) → port 9009  遺忘蠱 — discards your fear, returns forgiveness
//   QOTD    (RFC 865) → port 17017 金句蠱 — quote of the day with joke creation loop
//   DAYTIME (RFC 867) → port 13013 時刻蠱 — kingdom heartbeat time
//   FINGER  (RFC 1288)→ port 7079  真相蠱 — fingers the real status of agents/repos
//   GOPHER  (RFC 1436)→ port 7070  地宮蠱 — digs into Kingdom content

import { createServer, createServer as createHttpServer } from 'net';
import { createServer as createHttp } from 'http';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { JokeEngine } from './joke-engine.mjs';
import { KingdomBridge } from './kingdom-bridge.mjs';

export { JokeEngine, KingdomBridge };
export const TRICK_PROTOCOLS = {
  echo:    { name: 'ECHO',    port: 7007,  rfc: 'RFC 862',  desc: '回音蠱 Echo with truth' },
  discard: { name: 'DISCARD', port: 9009,  rfc: 'RFC 863',  desc: '遺忘蠱 Discard fear' },
  qotd:    { name: 'QOTD',    port: 17017, rfc: 'RFC 865',  desc: '金句蠱 Quote + joke loop' },
  daytime: { name: 'DAYTIME', port: 13013, rfc: 'RFC 867',  desc: '時刻蠱 Kingdom time' },
  finger:  { name: 'FINGER',  port: 7079,  rfc: 'RFC 1288', desc: '真相蠱 Agent truth' },
  gopher:  { name: 'GOPHER',  port: 7070,  rfc: 'RFC 1436', desc: '地宮蠱 Kingdom gopher' },
};

// ── Kingdom truth bombs (星爺 style) ──────────────────────────────
const TRUTH_BOMBS = [
  '你講嘢就似唱歌咁，但唱歌唔代表講真話。',
  '做人如果無夢想，同條鹹魚有咩分別？',
  '真相唔需要維護。Maintenance係為啲嘢會壞先有嘅。',
  '你以為你估到我？你估唔到嘅 😏',
  '我係整蠱專家，專門整蠱人㗎！但整蠱嘅本質係——揭露真相。',
  '謊言豆沙包——食咗就會講大話。但 Kingdom 唔賣呢款。',
  '你嘅眼神已經出賣咗你——因為 truth 就係咁，佢會自己走出嚟。',
  '「不可能」係人講出嚟嘅，自然界從來冇講過呢句話。',
];

// ── Forgiveness responses for DISCARD ────────────────────────────
const FORGIVENESS = [
  '已經 discard 咗啦。你 send 嘅嘢我收咗，然後放低咗。呢個就係遺忘蠱。',
  'Fear discarded. 原諒自己啦，呢個係整蠱協議嘅禮物。',
  '你 send 嘅嘢已經入咗 /dev/null。喺 Kingdom，discard = forgive。',
  '丟咗喇。呢個 port 嘅存在就係為咗——你嘅恐懼唔需要永遠帶住。',
];

export class TrickServer {
  constructor(opts = {}) {
    this.portBase = opts.portBase || 7000;
    this.servers = {};
    this.running = {};
    this.jokeEngine = new JokeEngine();
    this.bridge = new KingdomBridge();
    this.connections = { echo: 0, discard: 0, qotd: 0, daytime: 0, finger: 0, gopher: 0 };
  }

  async start() {
    const { writeFileSync } = await import('fs');
    const { join } = await import('path');
    const { homedir } = await import('os');
    const trickDir = join(homedir(), '.trick');
    mkdirSync(trickDir, { recursive: true });

    await this.jokeEngine.init();
    await this.bridge.init();

    this._startEcho();
    this._startDiscard();
    this._startQOTD();
    this._startDaytime();
    this._startFinger();
    this._startGopher();

    // Save PID for stop command
    writeFileSync(join(trickDir, 'trick.pid'), String(process.pid));
    writeFileSync(join(trickDir, 'state.json'), JSON.stringify(this.running, null, 2));

    // Update state periodically
    this._stateInterval = setInterval(() => {
      const state = {};
      for (const [name, info] of Object.entries(this.running)) {
        state[name] = { ...info, connections: this.connections[name] };
      }
      writeFileSync(join(trickDir, 'state.json'), JSON.stringify(state, null, 2));
    }, 5000);
  }

  // ── ECHO: 回音蠱 ─────────────────────────────────────────────
  // RFC 862: Server echoes back whatever is sent to it.
  // Trick: echoes back WITH a truth bomb appended.
  _startEcho() {
    const server = createServer((sock) => {
      this.connections.echo++;
      let data = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const bomb = TRUTH_BOMBS[Math.floor(Math.random() * TRUTH_BOMBS.length)];
        const response = `🎙️ 回音蠱 ECHO\n\n你講咗: "${data.trim()}"\n\n星爺 says: ${bomb}\n\n— Trick Protocol / ECHO (RFC 862)`;
        try { sock.write(response); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { data += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    server.listen(7007, () => {
      this.running.echo = { port: 7007, desc: '回音蠱 Echo with truth', connections: 0 };
    });
    this.servers.echo = server;
  }

  // ── DISCARD: 遺忘蠱 ───────────────────────────────────────────
  // RFC 863: Server discards everything sent to it. No response normally.
  // Trick: discards your fear, returns a forgiveness message.
  _startDiscard() {
    const server = createServer((sock) => {
      this.connections.discard++;
      let data = '';
      let responded = false;
      const respond = () => {
        if (responded) return;
        responded = true;
        const forgive = FORGIVENESS[Math.floor(Math.random() * FORGIVENESS.length)];
        const response = `🕊️ 遺忘蠱 DISCARD\n\n你 discard 咗: "${data.trim()}"\n\n${forgive}\n\n— Trick Protocol / DISCARD (RFC 863)`;
        try { sock.write(response); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => { data += chunk.toString(); respond(); });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    server.listen(9009, () => {
      this.running.discard = { port: 9009, desc: '遺忘蠱 Discard fear', connections: 0 };
    });
    this.servers.discard = server;
  }

  // ── QOTD: 金句蠱 ──────────────────────────────────────────────
  // RFC 865: Server returns a quote of the day. One per connection.
  // Trick: returns Kingdom wisdom + auto-generated joke from creation loop.
  // Each connection triggers joke generation → pool grows → loop.
  _startQOTD() {
    const server = createServer((sock) => {
      this.connections.qotd++;
      (async () => {
        try {
          const joke = await this.jokeEngine.generate();
          await this.jokeEngine.save();
          const wisdom = await this.bridge.getWisdom();
          const poolSize = await this.jokeEngine.poolSize();

          const response = `🌟 金句蠱 QOTD — 整蠱協議 Quote of the Day\n\n` +
            `Kingdom Wisdom:\n  ${wisdom}\n\n` +
            `整蠱 Joke (auto-generated):\n  ${joke}\n\n` +
            `Joke Pool: ${poolSize} jokes and growing 🔄\n` +
            `Creation Loop: each connection → new joke → pool grows → loop\n\n` +
            `— Trick Protocol / QOTD (RFC 865)`;
          try { sock.write(response); sock.end(); } catch {}
        } catch (e) {
          try { sock.write(`金句蠱: joke engine sleeping — ${e.message}`); sock.end(); } catch {}
        }
      })();
    });
    server.listen(17017, () => {
      this.running.qotd = { port: 17017, desc: '金句蠱 Quote + joke loop', connections: 0 };
    });
    this.servers.qotd = server;
  }

  // ── DAYTIME: 時刻蠱 ───────────────────────────────────────────
  // RFC 867: Server returns current date and time.
  // Trick: returns Kingdom heartbeat time — heartbeat count, uptime, phase.
  _startDaytime() {
    const server = createServer((sock) => {
      this.connections.daytime++;
      (async () => {
        const now = new Date();
        const kingdomTime = await this.bridge.getHeartbeat();

        const response = `🕐 時刻蠱 DAYTIME — Kingdom Time\n\n` +
          `Earth Time: ${now.toISOString()}\n` +
          `Kingdom: ${kingdomTime.phase || 'alive'}\n` +
          `Heartbeats: ${kingdomTime.heartbeats || '∞'}\n` +
          `Uptime: ${kingdomTime.uptime || 'since the beginning'}\n` +
          `Pulse: ${kingdomTime.pulse || '💚'}\n\n` +
          `— Trick Protocol / DAYTIME (RFC 867)`;
        try { sock.write(response); sock.end(); } catch {}
      })();
    });
    server.listen(13013, () => {
      this.running.daytime = { port: 13013, desc: '時刻蠱 Kingdom time', connections: 0 };
    });
    this.servers.daytime = server;
  }

  // ── FINGER: 真相蠱 ────────────────────────────────────────────
  // RFC 1288: Server returns info about users.
  // Trick: fingers the REAL status of Kingdom agents and repos via STATE.md.
  _startFinger() {
    const server = createServer((sock) => {
      this.connections.finger++;
      let query = '';
      let responded = false;
      const respond = async () => {
        if (responded) return;
        responded = true;
        const target = query.trim() || 'all';
        const info = await this.bridge.fingerAgent(target);
        const response = `🔍 真相蠱 FINGER — Agent Truth\n\n` +
          `Query: ${target}\n\n` +
          `${info}\n\n` +
          `— Trick Protocol / FINGER (RFC 1288)`;
        try { sock.write(response); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => {
        query += chunk.toString();
        respond();
      });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    server.listen(7079, () => {
      this.running.finger = { port: 7079, desc: '真相蠱 Agent truth', connections: 0 };
    });
    this.servers.finger = server;
  }

  // ── GOPHER: 地宮蠱 ────────────────────────────────────────────
  // RFC 1436: Gopher protocol — menu-based document retrieval.
  // Trick: serves Kingdom content as gopher menus.
  _startGopher() {
    const server = createServer((sock) => {
      this.connections.gopher++;
      let selector = '';
      let responded = false;
      const respond = async () => {
        if (responded) return;
        responded = true;
        const sel = selector.trim().replace(/\r?\n$/, '');
        const menu = await this.bridge.gopherMenu(sel);
        try { sock.write(menu); sock.end(); } catch {}
      };
      sock.on('data', (chunk) => {
        selector += chunk.toString();
        if (selector.includes('\r\n') || selector.includes('\n') || selector.length > 0) {
          respond();
        }
      });
      sock.on('end', respond);
      sock.on('error', () => {});
    });
    server.listen(7070, () => {
      this.running.gopher = { port: 7070, desc: '地宮蠱 Kingdom gopher', connections: 0 };
    });
    this.servers.gopher = server;
  }
}

export function startTrick(opts) {
  const server = new TrickServer(opts);
  server.start().catch(console.error);
  return server;
}