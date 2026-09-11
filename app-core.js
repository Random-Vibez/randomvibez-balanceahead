export const STORAGE_KEY = 'balanceahead.state.v2';
export const MAX_ITEMS = 100;
export const MAX_FIELD_LENGTH = 80;
export const MAX_STATE_BYTES = 120000;
export const MAX_CENTS = 99999999999;
export const MAX_MONTH_ENTRIES = 120;
export const CURRENCIES = ['USD', 'CAD', 'GBP', 'EUR', 'AUD', 'NZD'];
export const SAMPLE_ITEMS = [
  { id: 'sample-pay', type: 'income', name: 'Paycheck', amountCents: 320000, day: 1, recurrence: 'monthly', createdMonth: '2026-09', statusByMonth: {} },
  { id: 'sample-rent', type: 'bill', name: 'Rent', amountCents: 145000, day: 3, recurrence: 'monthly', createdMonth: '2026-09', statusByMonth: {} },
  { id: 'sample-phone', type: 'bill', name: 'Phone plan', amountCents: 6500, day: 14, recurrence: 'monthly', createdMonth: '2026-09', statusByMonth: {} },
  { id: 'sample-groceries', type: 'bill', name: 'Groceries', amountCents: 45000, day: 20, recurrence: 'one-time', createdMonth: '2026-09', statusByMonth: {} },
];
const cleanText = value => String(value ?? '').trim().slice(0, MAX_FIELD_LENGTH);
const validMonth = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
const validType = value => value === 'income' || value === 'bill';
const validStatus = value => value === 'pending' || value === 'paid';
const validCurrency = value => CURRENCIES.includes(value);
const validCents = value => Number.isSafeInteger(value) && Math.abs(value) <= MAX_CENTS;
const validMap = (map, { nonnegative = false } = {}) => {
  if (!map || typeof map !== 'object' || Array.isArray(map) || Object.keys(map).length > MAX_MONTH_ENTRIES) return false;
  return Object.entries(map).every(([month, value]) => validMonth(month) && validCents(value) && (!nonnegative || value >= 0));
};
export function canAddMonthEntry(map, month) { return Object.prototype.hasOwnProperty.call(map ?? {}, month) || Object.keys(map ?? {}).length < MAX_MONTH_ENTRIES; }
export function setMonthEntry(map, month, value) {
  if (!canAddMonthEntry(map, month)) throw new RangeError('month entry limit reached');
  return { ...(map ?? {}), [month]: value };
}
const generatedId = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function createDefaultState(month = new Date().toISOString().slice(0, 7)) {
  const selected = validMonth(month) ? month : new Date().toISOString().slice(0, 7);
  return { app: 'balanceahead', version: 2, month: selected, startingBalances: { [selected]: 0 }, safetyBufferCents: 0, currency: 'USD', items: [] };
}

export function normalizeItem(raw, fallbackMonth = new Date().toISOString().slice(0, 7)) {
  if (!raw || typeof raw !== 'object' || !validType(raw.type)) return null;
  const amount = Number(raw.amountCents); const day = Number(raw.day);
  const createdMonth = validMonth(raw.createdMonth) ? raw.createdMonth : fallbackMonth;
  const recurrence = raw.recurrence === 'one-time' ? 'one-time' : raw.recurrence === 'monthly' ? 'monthly' : null;
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_CENTS || !Number.isInteger(day) || day < 1 || day > 31 || !recurrence) return null;
  const id = cleanText(raw.id) || generatedId(); if (!id || id.length > MAX_FIELD_LENGTH) return null;
  const sourceStatuses = raw.statusByMonth && typeof raw.statusByMonth === 'object' ? raw.statusByMonth : {};
  if (Object.keys(sourceStatuses).length > MAX_MONTH_ENTRIES || !Object.entries(sourceStatuses).every(([month, status]) => validMonth(month) && validStatus(status))) return null;
  return { id, type: raw.type, name: cleanText(raw.name) || 'Unnamed item', amountCents: amount, day, recurrence, createdMonth, statusByMonth: Object.fromEntries(Object.entries(sourceStatuses)) };
}

function migrateV1(raw) {
  if (!raw || raw.version !== 1 || !validMonth(raw.month) || !Array.isArray(raw.items)) return null;
  const items = raw.items.map(item => normalizeItem({ ...item, recurrence: item.recurrence || 'monthly', createdMonth: raw.month, statusByMonth: { [raw.month]: item.status === 'paid' ? 'paid' : 'pending' } }, raw.month));
  if (items.some(item => !item)) return null;
  const starting = Number(raw.startingBalanceCents); const buffer = Number(raw.safetyBufferCents);
  if (!validCents(starting) || !validCents(buffer) || buffer < 0 || items.length > MAX_ITEMS) return null;
  return { app: 'balanceahead', version: 2, month: raw.month, startingBalances: { [raw.month]: starting }, safetyBufferCents: buffer, currency: 'GBP', items };
}

export function normalizeState(raw) {
  if (raw?.version === 1) return migrateV1(raw);
  if (!raw || typeof raw !== 'object' || raw.app !== 'balanceahead' || raw.version !== 2 || !validMonth(raw.month) || !validMap(raw.startingBalances) || !validCents(Number(raw.safetyBufferCents)) || Number(raw.safetyBufferCents) < 0 || !validCurrency(raw.currency) || !Array.isArray(raw.items) || raw.items.length > MAX_ITEMS) return null;
  const items = raw.items.map(item => normalizeItem(item, raw.month));
  if (items.some(item => !item) || new Set(items.map(item => item.id)).size !== items.length) return null;
  return { app: 'balanceahead', version: 2, month: raw.month, startingBalances: Object.fromEntries(Object.entries(raw.startingBalances).map(([m, v]) => [m, Number(v)])), safetyBufferCents: Number(raw.safetyBufferCents), currency: raw.currency, items };
}

export function addMonths(month, offset) { const [year, monthNumber] = month.split('-').map(Number); const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1)); return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; }
export function daysInMonth(month) { const [year, monthNumber] = month.split('-').map(Number); return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate(); }
export function itemApplies(item, month) { return item.recurrence === 'monthly' ? month >= item.createdMonth : month === item.createdMonth; }
export function itemDay(item, month) { return Math.min(item.day, daysInMonth(month)); }
export function buildForecast(state) {
  const month = state.month; const days = daysInMonth(month); let balanceCents = Number(state.startingBalances?.[month] ?? 0);
  return Array.from({ length: days }, (_, index) => { const day = index + 1; const events = state.items.filter(item => itemApplies(item, month) && itemDay(item, month) === day && item.statusByMonth?.[month] !== 'paid'); const transactions = events.map(item => ({ ...item, signedAmountCents: item.type === 'income' ? item.amountCents : -item.amountCents })); balanceCents += transactions.reduce((sum, event) => sum + event.signedAmountCents, 0); return { day, balanceCents, transactions }; });
}
export function buildTimeline(state) { const days = daysInMonth(state.month); return state.items.filter(item => itemApplies(item, state.month)).reduce((groups, item) => { const day = itemDay(item, state.month); (groups[day] ??= []).push(item); return groups; }, []).map((items, index) => ({ day: index + 1, items })).filter(group => group.items); }
export function summarizeForecast(forecast, safetyBufferCents = 0) { const lowest = forecast.reduce((min, day) => Math.min(min, day.balanceCents), Infinity); const monthEnd = forecast.at(-1)?.balanceCents ?? 0; const warningLevel = lowest < 0 ? 'critical' : lowest < safetyBufferCents ? 'warning' : 'safe'; return { lowestBalanceCents: lowest === Infinity ? 0 : lowest, monthEndBalanceCents: monthEnd, warningLevel }; }
export function exportState(state) { const normalized = normalizeState(state); if (!normalized) throw new RangeError('cannot export invalid state'); return JSON.stringify({ app:'balanceahead', version:2, exportedAt:new Date().toISOString(), month:normalized.month, startingBalances:normalized.startingBalances, safetyBufferCents:normalized.safetyBufferCents, currency:normalized.currency, items:normalized.items }, null, 2); }
export function importState(serialized) { if (typeof serialized !== 'string' || serialized.length > MAX_STATE_BYTES) return null; try { return normalizeState(JSON.parse(serialized)); } catch { return null; } }
export function formatCents(cents, currency = 'USD') { return new Intl.NumberFormat('en-US', { style:'currency', currency:validCurrency(currency) ? currency : 'USD', currencyDisplay:'symbol', minimumFractionDigits:2, maximumFractionDigits:2 }).format(cents / 100); }
export function heightClass(percent) { return `height-${Math.max(5, Math.min(100, Math.round(percent / 5) * 5))}`; }
