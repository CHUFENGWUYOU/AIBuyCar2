// 积分服务：余额/流水/商品目录 + 北京时间格式化
const KEY_BALANCE = 'buycar_points_balance';
const KEY_LEDGER = 'buycar_points_ledger';
const KEY_CATALOG = 'buycar_points_catalog';

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, v) {
  localStorage.setItem(key, JSON.stringify(v));
}
function uid() {
  return 'p_' + Math.random().toString(36).slice(2) + Date.now();
}

export function getPointsBalance() {
  const n = Number(localStorage.getItem(KEY_BALANCE));
  return Number.isFinite(n) ? n : 0;
}
function setPointsBalance(n) {
  localStorage.setItem(KEY_BALANCE, String(Math.max(0, Math.floor(n))));
}

export function getPointsLedger() {
  return readJSON(KEY_LEDGER, []);
}
function pushLedger(entry) {
  const list = getPointsLedger();
  list.unshift(entry);
  writeJSON(KEY_LEDGER, list);
}

export function earnPoints(amount, reason = '积分获取') {
  const prev = getPointsBalance();
  const next = prev + Math.max(0, Math.floor(amount));
  setPointsBalance(next);
  pushLedger({
    id: uid(),
    ts: Date.now(),
    kind: 'earn',
    amount: Math.max(0, Math.floor(amount)),
    before: prev,
    after: next,
    reason
  });
  return next;
}

export function redeemPoints(amount, reason = '积分兑换') {
  const cost = Math.max(0, Math.floor(amount));
  const prev = getPointsBalance();
  if (prev < cost) return { ok: false, balance: prev };
  const next = prev - cost;
  setPointsBalance(next);
  pushLedger({
    id: uid(),
    ts: Date.now(),
    kind: 'redeem',
    amount: cost,
    before: prev,
    after: next,
    reason
  });
  return { ok: true, balance: next };
}

const DEFAULT_CATALOG = [
  { id: 'gift_keychain', name: '车标钥匙扣', cost: 50 },
  { id: 'gift_wash', name: '洗车券（1次）', cost: 80 },
  { id: 'gift_charge10', name: '充电卡 10 元', cost: 120 },
  { id: 'gift_phone_mount', name: '车载手机支架', cost: 150 }
];

export function getCatalog() {
  const v = readJSON(KEY_CATALOG, null);
  return Array.isArray(v) && v.length > 0 ? v : DEFAULT_CATALOG;
}
export function setCatalog(items) {
  if (Array.isArray(items)) writeJSON(KEY_CATALOG, items);
}

export function redeemItem(itemId) {
  const item = getCatalog().find(i => i.id === itemId);
  if (!item) return { ok: false, error: '商品不存在' };
  const res = redeemPoints(item.cost, `兑换-${item.name}`);
  return { ok: res.ok, balance: res.balance, item };
}

// 北京时间格式（YYYY-MM-DD HH:mm）
export function formatBeijingTime(ts) {
  const fmt = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(ts));
  const [date, time] = fmt.split(' ');
  return date.replace(/\//g, '-') + ' ' + time;
}