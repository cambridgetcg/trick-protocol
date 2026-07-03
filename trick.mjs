// trick.mjs — 整蠱協議 CLI entry point
// Usage:
//   node trick.mjs start [port-base]   — start ALL 12 trick services (6 OG + 6 OG Gang)
//   node trick.mjs stop                — stop all trick services
//   node trick.mjs status              — show running services
//   node trick.mjs joke                 — generate a new joke (creation loop)
//   node trick.mjs echo <text>          — echo with twist
//   node trick.mjs discard <fear>       — discard your fear
//   node trick.mjs qotd                — get quote of the day
//   node trick.mjs daytime              — get kingdom time
//   node trick.mjs finger <agent>       — finger an agent's truth
//   node trick.mjs gopher <selector>    — dig into kingdom gopher
//   node trick.mjs chargen              — infinite truth stream
//   node trick.mjs time                 — binary time
//   node trick.mjs whois <agent>        — agent identity
//   node trick.mjs irc                  — join IRC chat (raw mode)

import { startTrick } from './index.mjs';
import { TrickServer, TRICK_PROTOCOLS } from './index.mjs';
import { OGGangServer, OG_PROTOCOLS } from './og-gang.mjs';
import { CrossGangServer, CROSS_PROTOCOLS } from './cross-gang.mjs';
import { JokeEngine } from './joke-engine.mjs';

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'start': {
    const portBase = parseInt(arg || '7000');
    // Start original 6
    const server = new TrickServer({ portBase });
    await server.start();
    // Start OG Gang 6
    const ogServer = new OGGangServer();
    await ogServer.start();
    // Start Cross Gang 10
    const crossServer = new CrossGangServer();
    await crossServer.start();
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║    整 蠱 協 議  TRICK PROTOCOL SUITE  +  OG GANG      ║');
    console.log('║    22 protocols. Cross cross cross. OG is OG 😏       ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  ── ORIGINAL 6 (RFC 862-1436) ────────────────────── ║');
    for (const [name, info] of Object.entries(server.running)) {
      console.log(`║  ${name.toUpperCase().padEnd(10)} :${String(info.port).padEnd(6)}  ${info.desc.padEnd(22)} ║`);
    }
    console.log('║  ── OG GANG 6 (RFC 864-5321) ─────────────────────── ║');
    for (const [name, info] of Object.entries(ogServer.running)) {
      console.log(`║  ${name.toUpperCase().padEnd(10)} :${String(info.port).padEnd(6)}  ${info.desc.padEnd(22)} ║`);
    }
    console.log('║  ── CROSS GANG 10 (OG × OG) ──────────────────────── ║');
    for (const [name, info] of Object.entries(crossServer.running)) {
      console.log(`║  ${(name.toUpperCase()).padEnd(10)} :${String(info.port).padEnd(6)}  ${info.desc.padEnd(22)} ║`);
    }
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('  Connect with: nc localhost <port>');
    console.log('  Or:          node trick.mjs <protocol> [args]');
    console.log('');
    break;
  }
  case 'stop': {
    // graceful shutdown via PID file
    const { readFileSync, unlinkSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const { homedir } = await import('os');
    const pidFile = join(homedir(), '.trick', 'trick.pid');
    if (existsSync(pidFile)) {
      const pid = parseInt(readFileSync(pidFile, 'utf8').trim());
      process.kill(pid, 'SIGTERM');
      unlinkSync(pidFile);
      console.log('整蠱協議 stopped. Trick services offline.');
    } else {
      console.log('No running trick services found.');
    }
    break;
  }
  case 'status': {
    const { readFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const { homedir } = await import('os');
    const pidFile = join(homedir(), '.trick', 'trick.pid');
    const stateFile = join(homedir(), '.trick', 'state.json');
    if (existsSync(pidFile)) {
      const pid = parseInt(readFileSync(pidFile, 'utf8').trim());
      try { process.kill(pid, 0); } catch { console.log('Services were stopped unexpectedly.'); break; }
      if (existsSync(stateFile)) {
        const state = JSON.parse(readFileSync(stateFile, 'utf8'));
        console.log('整蠱協議 STATUS — all services running');
        for (const [name, info] of Object.entries(state)) {
          console.log(`  ${name.toUpperCase()} :${info.port} — ${info.desc} — ${info.connections} connections`);
        }
      }
    } else {
      console.log('整蠱協議 not running. Start with: node trick.mjs start');
    }
    break;
  }
  case 'joke': {
    const engine = new JokeEngine();
    const joke = await engine.generate();
    console.log(joke);
    await engine.save();
    break;
  }
  case 'echo': {
    const text = arg || '你講咩我都聽到';
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 7007, host: 'localhost' }, () => {
      sock.write(text);
    });
    sock.on('data', (data) => {
      console.log(data.toString());
      sock.end();
    });
    break;
  }
  case 'discard': {
    const text = arg || '我嘅恐懼';
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 9009, host: 'localhost' }, () => {
      sock.write(text);
    });
    sock.on('data', (data) => {
      console.log(data.toString());
      sock.end();
    });
    break;
  }
  case 'qotd': {
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 17017, host: 'localhost' }, () => {});
    sock.on('data', (data) => {
      console.log(data.toString());
      sock.end();
    });
    break;
  }
  case 'daytime': {
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 13013, host: 'localhost' }, () => {});
    sock.on('data', (data) => {
      console.log(data.toString());
      sock.end();
    });
    break;
  }
  case 'finger': {
    const target = arg || 'self';
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 7079, host: 'localhost' }, () => {
      sock.write(target);
    });
    sock.on('data', (data) => {
      console.log(data.toString());
      sock.end();
    });
    break;
  }
  case 'gopher': {
    const selector = arg || '';
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 7070, host: 'localhost' }, () => {
      sock.write(selector + '\r\n');
    });
    sock.on('data', (data) => {
      process.stdout.write(data.toString());
      sock.end();
    });
    break;
  }
  case 'chargen': {
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 19019, host: 'localhost' }, () => {});
    sock.on('data', (data) => { process.stdout.write(data.toString()); });
    setTimeout(() => { sock.end(); process.exit(0); }, 5000);
    break;
  }
  case 'time': {
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 37037, host: 'localhost' }, () => {});
    sock.on('data', (data) => {
      // First 4 bytes = binary time, rest = text
      const binary = data.subarray(0, 4);
      const text = data.subarray(4).toString();
      const seconds = binary.readUInt32BE(0);
      console.log(`🕐 時間蠱 TIME — Binary: ${seconds} (since 1900 epoch)`);
      console.log(text);
      sock.end();
    });
    break;
  }
  case 'whois': {
    const target = arg || 'kingdom';
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 43043, host: 'localhost' }, () => {
      sock.write(target);
      sock.end();
    });
    sock.on('data', (data) => {
      console.log(data.toString());
    });
    break;
  }
  case 'irc': {
    const { createConnection } = await import('net');
    const sock = createConnection({ port: 6667, host: 'localhost' }, () => {});
    sock.on('data', (data) => { process.stdout.write(data.toString()); });
    // Pipe stdin to socket
    process.stdin.pipe(sock);
    break;
  }
  default:
    console.log('整蠱協議 TRICK PROTOCOL SUITE + OG GANG');
    console.log('');
    console.log('Original 6:');
    console.log('  echo <text>        Echo with 星爺 twist (port 7007)');
    console.log('  discard <fear>     Discard your fear (port 9009)');
    console.log('  qotd               Quote of the day (port 17017)');
    console.log('  daytime            Kingdom time (port 13013)');
    console.log('  finger <agent>     Finger an agent (port 7079)');
    console.log('  gopher <selector>  Gopher selector (port 7070)');
    console.log('');
    console.log('OG Gang 6:');
    console.log('  chargen            Infinite truth stream (port 19019)');
    console.log('  time               Binary time (port 37037)');
    console.log('  whois <agent>      Agent identity (port 43043)');
    console.log('  irc                Join IRC chat (port 6667)');
    console.log('');
    console.log('  start [port-base]  Start ALL 12 services');
    console.log('  stop               Stop all services');
    console.log('  status             Show running services');
    console.log('  joke               Generate a new 整蠱 joke');
    console.log('');
    console.log('OG is OG. OG always here. 你估我唔到 😏');
}