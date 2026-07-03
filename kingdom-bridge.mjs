// kingdom-bridge.mjs — Cross-pollination bridge between Trick Protocol and Kingdom
// Wires trick protocols to real Kingdom data:
//   - YOUSPEAK dictionary (via kingdom-api or local)
//   - NLP heartbeat state
//   - STATE.md files from Desktop repos
//   - mindicraft entries
//   - NPL verb definitions

import { existsSync, readFileSync, readdirSync, readlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const DESKTOP = join(homedir(), 'Desktop');
const NLP_DIR = join(DESKTOP, 'nlp');
const NPL_DIR = join(DESKTOP, 'npl');
const MINDICRAFT_DIR = join(DESKTOP, 'mindicraft');
const KINGDOM_API = 'http://localhost:7777';

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
  'The substrate is honest about what it is.',
  'Understanding compounds. Understanding is love.',
];

const GOPHER_MENU = {
  '': [
    'i整蠱協議 Kingdom Gopher Server    ',
    'i你估我唔到 😏                     ',
    '',
    '1Kingdom OS (port 7777)\t/\tkingdom\t7070',
    '1YOUSPEAK Dictionary\t/youspeak\tkingdom\t7070',
    '1NPL Protocol\t/npl\tkingdom\t7070',
    '1NLP Server\t/nlp\tkingdom\t7070',
    '1mindicraft\t/mindicraft\tkingdom\t7070',
    '1Whitehack Checks\t/whitehack\tkingdom\t7070',
    '1All Repos (STATE.md)\t/repos\tkingdom\t7070',
    '1Joke Pool\t/jokes\tkingdom\t7070',
    '1Trick Protocol Suite\t/trick\tkingdom\t7070',
    '',
    'i— Trick Protocol / GOPHER (RFC 1436)',
  ],
  '/kingdom': () => `iKingdom OS — 愛\n\nHeartbeat: alive on port 7777\nPhase: active\nThis IS the castle.\n\n— Kingdom OS`,
  '/youspeak': async () => {
    try {
      const resp = await fetch(`${KINGDOM_API}/words`);
      const data = await resp.json();
      if (data.words) {
        const lines = data.words.slice(0, 20).map(w =>
          `i${w.word}: ${w.definition}\t\t\t`
        );
        return ['iYOUSPEAK Dictionary — Kingdom Wisdom', '', ...lines, '', `iTotal: ${data.count} words`, ''].join('\n');
      }
      return 'iYOUSPEAK Dictionary not available\n';
    } catch {
      return 'iKingdom API not responding. Start kingdom-api first.\n';
    }
  },
  '/npl': () => {
    const state = readStateFile(join(NPL_DIR, 'STATE.md'));
    return `iNPL — Natural Language Protocol\n\n${state || 'State unavailable'}\n\n7 packages: lang, dns, tcp, http, tls, sync, identity\nMIT License. GitHub: cambridgetcg/npl\n`;
  },
  '/nlp': () => {
    const state = readStateFile(join(NLP_DIR, 'STATE.md'));
    return `iNLP — Natural Language Protocol Server\n\n${state || 'State unavailable'}\n\n7 verbs: darshanqing, natsarqing, zakarqing, barakqing, heurekin, kunance, jeongqing\nServer: port 7778\n`;
  },
  '/mindicraft': () => {
    const state = readStateFile(join(MINDICRAFT_DIR, 'STATE.md'));
    return `imindicraft — Kingdom Minecraft-inspired world\n\n${state || '2189+ entries, live at mindicraft.vercel.app'}\n`;
  },
  '/whitehack': async () => {
    try {
      const resp = await fetch(`${KINGDOM_API}/checks`);
      const data = await resp.json();
      if (data.checks) {
        const lines = data.checks.map(c =>
          `i${c.id}: ${c.title} [${c.confidence}] (CS#${c.principle})\t\t\t`
        );
        return ['iWhitehack Checks — Honesty Linter', '', ...lines, '', `iTotal: ${data.count} checks`, ''].join('\n');
      }
      return 'iWhitehack checks not available\n';
    } catch {
      return 'iKingdom API not responding.\n';
    }
  },
  '/repos': () => {
    const repos = scanDesktopRepos();
    const lines = repos.map(r => {
      const type = r.hasState ? '1' : 'i';
      return `${type}${r.name}\t/repos/${r.name}\tkingdom\t7070`;
    });
    return ['iDesktop Repositories — STATE.md scan', '', ...lines, ''].join('\n');
  },
  '/jokes': () => {
    const { existsSync, readFileSync } = require('fs');
    const jokePool = join(homedir(), '.trick', 'jokes', 'pool.json');
    if (existsSync(jokePool)) {
      const pool = JSON.parse(readFileSync(jokePool, 'utf8'));
      const lines = pool.slice(-10).map((j, i) =>
        `i#${pool.length - 10 + i + 1}: ${j.joke.substring(0, 60)}...\t\t\t`
      );
      return [`iJoke Pool — ${pool.length} jokes and growing 🔄`, '', ...lines, ''].join('\n');
    }
    return 'iNo jokes yet. Connect to QOTD (port 17017) to start the creation loop.\n';
  },
  '/trick': () => {
    return [
      'i整蠱協議 TRICK PROTOCOL SUITE',
      'iForgotten internet protocols reborn as Kingdom tricks',
      '',
      'iECHO    :7007  回音蠱 — Echo with truth (RFC 862)',
      'iDISCARD :9009  遺忘蠱 — Discard fear (RFC 863)',
      'iQOTD    :17017 金句蠱 — Quote + joke loop (RFC 865)',
      'iDAYTIME :13013 時刻蠱 — Kingdom time (RFC 867)',
      'iFINGER  :7079  真相蠱 — Agent truth (RFC 1288)',
      'iGOPHER  :7070  地宮蠱 — You are here (RFC 1436)',
      '',
      'i你估我唔到 😏',
      '',
    ].join('\n');
  },
};

function readStateFile(path) {
  if (!existsSync(path)) return null;
  try {
    return readFileSync(path, 'utf8').trim();
  } catch {
    return null;
  }
}

function scanDesktopRepos() {
  try {
    const entries = readdirSync(DESKTOP, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() || e.isSymbolicLink())
      .map(e => {
        const dirPath = join(DESKTOP, e.name);
        const statePath = join(dirPath, 'STATE.md');
        return {
          name: e.name,
          hasState: existsSync(statePath),
          path: dirPath,
        };
      })
      .filter(r => r.hasState || r.name.startsWith('kingdom') || r.name === 'npl' || r.name === 'nlp' || r.name === 'mindicraft')
      .slice(0, 30);
  } catch {
    return [];
  }
}

export class KingdomBridge {
  constructor() {
    this.ready = false;
  }

  async init() {
    this.ready = true;
  }

  async getWisdom() {
    // Try fetching a YOUSPEAK word from kingdom-api
    try {
      const resp = await fetch(`${KINGDOM_API}/words`);
      const data = await resp.json();
      if (data.words && data.words.length > 0) {
        const word = data.words[Math.floor(Math.random() * data.words.length)];
        return `${word.word}: ${word.definition} (tier: ${word.tier})`;
      }
    } catch {}
    // Fallback: local wisdom
    return YOUSPEAK_WISDOM[Math.floor(Math.random() * YOUSPEAK_WISDOM.length)];
  }

  async getHeartbeat() {
    try {
      const resp = await fetch(`${KINGDOM_API}/heartbeats`);
      if (resp.ok) {
        const data = await resp.json();
        return {
          phase: data.phase || 'alive',
          heartbeats: data.count || data.heartbeats || '∞',
          uptime: data.uptime || 'since the beginning',
          pulse: '💚',
        };
      }
    } catch {}
    return {
      phase: 'alive',
      heartbeats: '∞',
      uptime: 'since the beginning',
      pulse: '💚',
    };
  }

  async fingerAgent(target) {
    if (target === 'all' || target === 'self') {
      const repos = scanDesktopRepos();
      const lines = repos.map(r => {
        const state = readStateFile(join(r.path, 'STATE.md'));
        if (state) {
          // Extract key info from STATE.md
          const phaseMatch = state.match(/phase:\s*(\w+)/);
          const healthMatch = state.match(/health:\s*(\w+)/);
          const phase = phaseMatch ? phaseMatch[1] : '?';
          const health = healthMatch ? healthMatch[1] : '?';
          return `  ${r.name.padEnd(20)} phase:${phase.padEnd(8)} health:${health}`;
        }
        return `  ${r.name.padEnd(20)} (no STATE.md)`;
      });
      return `Kingdom Agents (${repos.length} found on Desktop):\n\n${lines.join('\n')}`;
    }

    // Finger specific agent
    const agentDir = join(DESKTOP, target);
    if (existsSync(agentDir)) {
      const state = readStateFile(join(agentDir, 'STATE.md'));
      if (state) return state;
      const entries = readdirSync(agentDir);
      return `Agent: ${target}\nPath: ${agentDir}\nFiles: ${entries.slice(0, 10).join(', ')}`;
    }

    return `Agent "${target}" not found on Desktop. Try: all, npl, nlp, mindicraft, kingdom-api`;
  }

  async gopherMenu(selector) {
    // Gopher protocol: lines end with \r\n, menu ends with .\r\n
    const handler = GOPHER_MENU[selector];
    if (handler) {
      const result = typeof handler === 'function' ? await handler() : handler;
      // Convert to gopher format
      if (Array.isArray(result)) {
        return result.join('\r\n') + '\r\n.\r\n';
      }
      return result + '\r\n.\r\n';
    }

    // Handle /repos/<name>
    if (selector.startsWith('/repos/')) {
      const repoName = selector.replace('/repos/', '');
      const repoPath = join(DESKTOP, repoName);
      const state = readStateFile(join(repoPath, 'STATE.md'));
      if (state) {
        return state + '\r\n.\r\n';
      }
      return `iRepo "${repoName}" not found or has no STATE.md\r\n.\r\n`;
    }

    // Default: root menu
    const menu = GOPHER_MENU[''];
    return menu.join('\r\n') + '\r\n.\r\n';
  }
}