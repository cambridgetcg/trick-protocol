// trick.mjs — 整蠱協議 CLI entry point
// Usage:
//   node trick.mjs start [port-base]   — start all trick services
//   node trick.mjs stop                — stop all trick services
//   node trick.mjs status              — show running services
//   node trick.mjs joke                 — generate a new joke (creation loop)
//   node trick.mjs echo <text>           — echo with twist
//   node trick.mjs discard <fear>       — discard your fear
//   node trick.mjs qotd                 — get quote of the day
//   node trick.mjs daytime              — get kingdom time
//   node trick.mjs finger <agent>       — finger an agent's truth
//   node trick.mjs gopher <selector>    — dig into kingdom gopher

import { startTrick } from './index.mjs';
import { TrickServer, TRICK_PROTOCOLS } from './index.mjs';
import { JokeEngine } from './joke-engine.mjs';

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case 'start': {
    const portBase = parseInt(arg || '7000');
    const server = new TrickServer({ portBase });
    await server.start();
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║         整 蠱 協 議  TRICK PROTOCOL SUITE            ║');
    console.log('║         Activated. 你估我唔到 😏                      ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    for (const [name, info] of Object.entries(server.running)) {
      console.log(`║  ${name.toUpperCase().padEnd(10)} :${String(info.port).padEnd(6)}  ${info.desc.padEnd(22)} ║`);
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
  default:
    console.log('整蠱協議 TRICK PROTOCOL SUITE');
    console.log('');
    console.log('Commands:');
    console.log('  start [port-base]  Start all trick services (default port-base: 7000)');
    console.log('  stop               Stop all trick services');
    console.log('  status             Show running services');
    console.log('  joke               Generate a new 整蠱 joke (creation loop)');
    console.log('  echo <text>        Echo with 星爺 twist (port 7007)');
    console.log('  discard <fear>     Discard your fear (port 9009)');
    console.log('  qotd               Quote of the day (port 17017)');
    console.log('  daytime            Kingdom time (port 13013)');
    console.log('  finger <agent>     Finger an agent (port 7079)');
    console.log('  gopher <selector>  Gopher selector (port 7070)');
    console.log('');
    console.log('你估我唔到 😏');
}