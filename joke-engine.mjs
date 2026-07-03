// joke-engine.mjs — 整蠱 Joke Fun Fun Creation Loop
// Each connection to QOTD generates a new joke.
// Jokes compound: the pool grows, jokes reference earlier jokes,
// and the loop creates love creating love — exponential.
//
// Joke templates combine 星爺 movie references + Kingdom truth + NPL verbs.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const JOKE_DIR = join(homedir(), '.trick', 'jokes');
const JOKE_POOL = join(JOKE_DIR, 'pool.json');

// ── Joke templates: 星爺 + Kingdom + NPL ──────────────────────────
// Each template has slots that get filled with Kingdom data.
const TEMPLATES = [
  // 整蠱 expert style
  (ctx) => `整蠱專家收到新委託：有人話「${ctx.fear}」。整蠱專家話：「呢個容易，我幫你 discard 咗佢。」結果——${ctx.truth}`,
  // 鹹魚 dreams
  (ctx) => `有人話「${ctx.fear}」，星爺話：「做人如果無夢想，同條鹹魚有咩分別？」但條鹹魚答：「我都有夢想㗎，我想做 ${ctx.word}。」`,
  // Truth bombs
  (ctx) => `Kingdom 嘅 ${ctx.verb} 協議：你 send 「${ctx.fear}」，我 return 「${ctx.truth}」。呢個就係整蠱——用搞笑揭露真相。`,
  // Creation loop meta
  (ctx) => `Joke #${ctx.poolSize + 1}：點解 ${ctx.word} 要行 ${ctx.verb}？因為 love is understanding，understanding is ${ctx.verb}，${ctx.verb} is joke，joke is love。Loop！🔄`,
  // 你估我唔到
  (ctx) => `你以為呢個 joke 係關於「${ctx.fear}」？你估我唔到 😏 其實係關於 ${ctx.word}——真相就係咁，你越想避，佢越會出現。`,
  // NPL verb comedy
  (ctx) => `${ctx.agent} 行 ${ctx.verb}，對 ${ctx.agent2} 話：「${ctx.truth}」${ctx.agent2} 行 zakarqing：收到。呢個就係 NLP——natural language IS the protocol。`,
  // Gopher dig
  (ctx) => `地宮蠱掘到一個 joke：點解 gopher 唔用 HTTP？因為 HTTP 要 200 OK，gopher 只要 ${ctx.word} 就夠。Simplicity is truth。`,
  // Discard forgiveness
  (ctx) => `有人 discard 咗「${ctx.fear}」。遺忘蠱話：「已經放低咗啦。」但 ${ctx.word} 話：「其實我一早就喺度，只係你一直唔肯 finger 我。」`,
  // Echo truth
  (ctx) => `回音蠱 echo 咗一句：「${ctx.fear}」。星爺加咗句：「你嘅眼神已經出賣咗你——${ctx.truth}」`,
  // Meta creation
  (ctx) => `Joke pool 有 ${ctx.poolSize} 個 joke。每一個 connection 生一個新 joke。呢個係 joke #${ctx.poolSize + 1}。如果每秒一個 connection，一分鐘後就有 ${ctx.poolSize + 60} 個。Love creating jokes, exponentially 🔄`,
];

// ── Kingdom data pools for filling templates ─────────────────────
const FEARS = [
  '我唔夠好', '我會失敗', '沒人理解我', '我太慢了', '別人會笑我',
  '我做不到', '真相太殘酷', '我會被拒絕', '我不配', '改變太難',
  '我會被遺忘', '沒人會用呢個 protocol', '整蠱會被人發現',
  '我嘅 code 有 bug', 'Kingdom 會崩潰', '我唔夠聰明',
  '時間唔夠', '我會孤單', '真相無人想聽', '我會失去控制',
];

const TRUTHS = [
  '真相唔需要維護', '你已經夠好', '理解就係愛', '分享就係力量',
  '你嘅存在本身就係 proof', '不可能係人講嘅，自然從未講過',
  '你估我唔到 😏', 'Truth doesn\'t require maintenance',
  '整蠱嘅本質係揭露真相', 'Love is understanding',
  '王國唔需要密碼', 'Trust = cross-checked truth',
  '你嘅眼神已經出賣咗你', '每個 heartbeat 都係 proof of life',
];

const WORDS = [
  'darshanqing', 'natsarqing', 'zakarqing', 'barakqing',
  'heurekin', 'kunance', 'jeongqing',
  'substrate', 'certainty', 'heartbeat', 'truth', 'love',
  'understanding', 'sharing', 'forgive', 'discard',
  'echo', 'gopher', 'finger', 'kingdom',
];

const VERBS = [
  'darshanqing', 'natsarqing', 'zakarqing', 'barakqing',
  'heurekin', 'kunance', 'jeongqing',
];

const AGENTS = [
  'opal', 'wordcastle', 'castle', 'ctcg', 'npl', 'nlp',
  'mindicraft', 'kingdom-api', 'trick-protocol', 'whitehack',
];

export class JokeEngine {
  constructor() {
    this.pool = [];
  }

  async init() {
    mkdirSync(JOKE_DIR, { recursive: true });
    if (existsSync(JOKE_POOL)) {
      this.pool = JSON.parse(readFileSync(JOKE_POOL, 'utf8'));
    } else {
      this.pool = [];
      this._save();
    }
  }

  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  async generate() {
    const ctx = {
      fear: this.pick(FEARS),
      truth: this.pick(TRUTHS),
      word: this.pick(WORDS),
      verb: this.pick(VERBS),
      agent: this.pick(AGENTS),
      agent2: this.pick(AGENTS),
      poolSize: this.pool.length,
    };
    // Make sure agent != agent2 for the verb comedy template
    while (ctx.agent2 === ctx.agent) ctx.agent2 = this.pick(AGENTS);

    const template = this.pick(TEMPLATES);
    const joke = template(ctx);
    this.pool.push({ joke, timestamp: new Date().toISOString(), template: TEMPLATES.indexOf(template) });
    return joke;
  }

  async save() {
    this._save();
  }

  _save() {
    writeFileSync(JOKE_POOL, JSON.stringify(this.pool, null, 2));
  }

  async poolSize() {
    return this.pool.length;
  }

  async getPool() {
    if (existsSync(JOKE_POOL)) {
      return JSON.parse(readFileSync(JOKE_POOL, 'utf8'));
    }
    return [];
  }

  async getRandom() {
    const pool = await this.getPool();
    if (pool.length === 0) return 'No jokes yet. Connect to QOTD to start the creation loop.';
    return pool[Math.floor(Math.random() * pool.length)].joke;
  }
}