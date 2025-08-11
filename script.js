// ===== 候補（配列1つ化・役割ごと） =====
const PARTICLE = ["乃", "ノ", "の", "ヶ"]; // 2文字目でたまに出す
const FUNNY_SUFFIX = ["猫", "餅", "狸"]; // レア語尾（10%）

const PREFIX = [
  "福",
  "風",
  "天",
  "朝",
  "貴",
  "豪",
  "栃",
  "佐",
  "北",
  "玉",
  "若",
  "大",
  "東",
  "武",
  "高",
  "霧",
  "出",
  "国",
  "藤",
  "浜",
  "雄",
  "翔",
  "隆",
  "光",
  "王",
];
const CORE = [
  "雄",
  "翔",
  "隆",
  "勝",
  "光",
  "龍",
  "星",
  "司",
  "豊",
  "峰",
  "剛",
  "錦",
  "富",
  "輝",
  "王",
];
const SUFFIX = [
  "山",
  "海",
  "錦",
  "川",
  "花",
  "宮",
  "里",
  "羽",
  "田",
  "旭",
  "島",
  "城",
  "岩",
  "光",
  "高",
  "國",
  "翔",
  "櫻",
  "潮",
  "嶋",
  "豪",
  "州",
  "嵐",
  "力",
  "吉",
  "司",
  "道",
  "藤",
  "蔵",
  "号",
  "丸",
];
// ===== 重み（よく使われる字ほど数値↑） =====
const PREFIX_WEIGHT = {
  朝: 4,
  貴: 4,
  豪: 3,
  栃: 3,
  北: 2,
  玉: 2,
  若: 2,
  大: 2,
  東: 2,
  武: 2,
};
const CORE_WEIGHT = { 隆: 3, 翔: 3, 勝: 2, 光: 2, 龍: 2 };

//最後の字
const SUFFIX_WEIGHT = {
  山: 5,
  海: 4,
  丸: 4,
  司: 3,
  錦: 3,
  峰: 2,
  星: 2,
  岩: 2,
  龍: 2,
};
// ===== 共通ユーティリティ =====
const ALL = [...new Set([...PREFIX, ...CORE, ...SUFFIX])];
const NON_PARTICLE_SECOND = ALL.filter((c) => !PARTICLE.includes(c));

function weightedPick(list, weightMap, used) {
  const pool = list.filter((c) => !used.includes(c));
  const items = pool.flatMap((c) => Array(weightMap?.[c] ?? 1).fill(c));
  if (items.length === 0) return list[(Math.random() * list.length) | 0]; // 保険
  return items[(Math.random() * items.length) | 0];
}

function pick(arr, used) {
  // 通常ピック（必要なら残す）
  const pool = arr.filter((c) => !used.includes(c));
  const src = pool.length ? pool : arr;
  return src[(Math.random() * src.length) | 0];
}

// 粒の出現率（下げると落ち着く）
const PARTICLE_RATE = 0.3;

// 2文字目：一定確率で粒、そうでなければ粒以外から
function pickSecondChar(used) {
  if (PARTICLE.length && Math.random() < PARTICLE_RATE)
    return pick(PARTICLE, used);
  return weightedPick(NON_PARTICLE_SECOND, CORE_WEIGHT, used); // 真ん中っぽい字を少し優先
}

// 語尾：10%でレア、なければ重み付き
function pickSuffix(used) {
  if (FUNNY_SUFFIX.length && Math.random() < 0.1)
    return pick(FUNNY_SUFFIX, used);
  return weightedPick(SUFFIX, SUFFIX_WEIGHT, used);
}

// ===== テンプレ（型） =====
const TEMPLATES = {
  particle3() {
    // Prefix + (second) + Suffix
    const used = [];
    const a = weightedPick(PREFIX, PREFIX_WEIGHT, used);
    used.push(a);
    const b = pickSecondChar(used);
    used.push(b);
    const c = pickSuffix(used);
    used.push(c);
    return `${a}${b}${c}`;
  },
  core3() {
    // Prefix + Core + Suffix
    const used = [];
    const a = weightedPick(PREFIX, PREFIX_WEIGHT, used);
    used.push(a);
    const b = weightedPick(CORE, CORE_WEIGHT, used);
    used.push(b);
    const c = pickSuffix(used);
    used.push(c);
    return `${a}${b}${c}`;
  },
  core2() {
    // Core + Suffix（たまに前にPrefix）
    const used = [];
    const a = weightedPick(CORE, CORE_WEIGHT, used);
    used.push(a);
    const b = pickSuffix(used);
    used.push(b);
    if (Math.random() < 0.4) {
      const p = weightedPick(PREFIX, PREFIX_WEIGHT, used);
      return `${p}${a}${b}`;
    }
    return `${a}${b}`;
  },
};

// 重み：型の出現割合（3文字多め）
const TEMPLATE_WEIGHTS = { particle: 0.35, core3: 0.65, core2: 0.0 };

function pickTemplate() {
  const r = Math.random();
  if (r < TEMPLATE_WEIGHTS.particle) return TEMPLATES.particle3;
  if (r < TEMPLATE_WEIGHTS.particle + TEMPLATE_WEIGHTS.core3)
    return TEMPLATES.core3;
  return TEMPLATES.core2;
}

// --- 違和感バリア（避けたい並び） ---
const BAD_PAIRS = new Set([
  "川海",
  "山岩", // ← ここに増やす
]);

function beautify(name, retry = 10) {
  while (retry-- > 0) {
    if (![...BAD_PAIRS].some((pair) => name.includes(pair))) {
      return name; // 変な並びがなければOK
    }
    name = pickTemplate()(); // ダメなら作り直し
  }
  return name; // 10回やってもダメなら妥協
}

export function makeShikona() {
  return beautify(pickTemplate()());
}

// DOM
const shikona = document.querySelector("#shikona");
const generateBtn = document.querySelector("#generateBtn");
generateBtn?.addEventListener("click", () => {
  shikona.textContent = makeShikona();
});
