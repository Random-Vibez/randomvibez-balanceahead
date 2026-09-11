import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, normalizeState, normalizeItem, addMonths, daysInMonth, buildForecast, buildTimeline, summarizeForecast, exportState, importState, formatCents, SAMPLE_ITEMS, MAX_ITEMS, MAX_CENTS, MAX_MONTH_ENTRIES, canAddMonthEntry, setMonthEntry } from '../app-core.js';

test('v2 default state stores month starting balances and currency', () => {
  const state = createDefaultState('2026-09');
  assert.equal(state.version, 2); assert.equal(state.month, '2026-09');
  assert.deepEqual(state.startingBalances, { '2026-09': 0 });
  assert.equal(state.safetyBufferCents, 0); assert.equal(state.currency, 'USD');
});

test('normalization rejects duplicates, unsafe bounds, invalid recurrence, and oversized collections', () => {
  const item = { id: 'x', type: 'income', name: 'Pay', amountCents: 3000, day: 15, recurrence: 'monthly', statusByMonth: {} };
  assert.equal(normalizeState({ app:'balanceahead', version:2, month:'2026-09', startingBalances:{'2026-09':1250}, safetyBufferCents:500, currency:'CAD', items:[item, item] }), null);
  assert.equal(normalizeItem({ ...item, recurrence:'weekly' }), null);
  assert.equal(normalizeState({ app:'balanceahead', version:2, month:'2026-09', startingBalances:{'2026-09':MAX_CENTS+1}, safetyBufferCents:0, currency:'USD', items:[] }), null);
  assert.equal(normalizeState({ app:'balanceahead', version:2, month:'2026-09', startingBalances:{'2026-09':0}, safetyBufferCents:0, currency:'USD', items:Array.from({length:MAX_ITEMS+1}, (_,i)=>({...item,id:String(i)})) }), null);
});

test('safe v1 states migrate to v2 without losing selected month data', () => {
  const state = normalizeState({ app:'balanceahead', version:1, month:'2026-09', startingBalanceCents:-1250, safetyBufferCents:500, items:[{id:'x',type:'bill',name:'Rent',amountCents:1000,day:31,recurrence:'monthly',status:'pending'}] });
  assert.equal(state.version, 2); assert.equal(state.startingBalances['2026-09'], -1250); assert.equal(state.items[0].statusByMonth['2026-09'], 'pending');
});

test('forecast uses month-specific balances and completion while one-time items stay in creation month', () => {
  const item = {id:'r',type:'bill',name:'Recurring',amountCents:1000,day:1,recurrence:'monthly',createdMonth:'2026-09',statusByMonth:{'2026-09':'paid'}};
  const one = {id:'o',type:'income',name:'One off',amountCents:5000,day:1,recurrence:'one-time',createdMonth:'2026-09',statusByMonth:{'2026-09':'pending'}};
  const state = {app:'balanceahead',version:2,month:'2026-09',startingBalances:{'2026-09':10000},safetyBufferCents:0,currency:'USD',items:[item,one]};
  assert.equal(buildForecast(state)[0].balanceCents, 15000);
  assert.equal(buildForecast({...state,month:'2026-10',startingBalances:{'2026-10':0}})[0].balanceCents, -1000);
});

test('day 29-31 clamp consistently in forecast and timeline', () => {
  const state={app:'balanceahead',version:2,month:'2026-02',startingBalances:{'2026-02':0},safetyBufferCents:0,currency:'USD',items:[{id:'x',type:'bill',name:'Month end',amountCents:1000,day:31,recurrence:'monthly',createdMonth:'2026-01',statusByMonth:{}}]};
  assert.equal(buildForecast(state).at(-1).transactions[0].name,'Month end');
  assert.equal(buildTimeline(state).at(-1).day,29);
});

test('negative starting balance is valid but buffer cannot be negative', () => {
  const valid=normalizeState({app:'balanceahead',version:2,month:'2026-09',startingBalances:{'2026-09':-100},safetyBufferCents:0,currency:'EUR',items:[]});
  assert.equal(valid.startingBalances['2026-09'],-100); assert.equal(normalizeState({...valid,safetyBufferCents:-1}),null);
});

test('import/export is versioned, allowlisted, and rejects malformed status month maps', () => {
  const state=createDefaultState('2026-09'); const parsed=JSON.parse(exportState(state));
  assert.equal(parsed.version,2); assert.equal('unexpected' in parsed,false);
  assert.deepEqual(importState(JSON.stringify({...parsed,unknown:'x'})).items,[]);
  assert.equal(importState(JSON.stringify({...parsed,startingBalances:{'2026-09':0,'bad':1}})),null);
  assert.equal(importState('{broken'),null);
});

test('formatting supports the declared currencies without conversion', () => {
  for (const currency of ['USD','CAD','GBP','EUR','AUD','NZD']) assert.match(formatCents(1234,currency), /12[,.]34/);
});

test('month navigation, summary, and samples remain useful', () => {
  assert.equal(addMonths('2026-12',1),'2027-01'); assert.equal(daysInMonth('2028-02'),29);
  const forecast=buildForecast({app:'balanceahead',version:2,month:'2026-09',startingBalances:{'2026-09':10000},safetyBufferCents:2500,currency:'USD',items:[]});
  assert.equal(summarizeForecast(forecast,2500).monthEndBalanceCents,10000); assert.ok(SAMPLE_ITEMS.length>=3);
});

test('bounded month helpers reject new entries at the cap without mutating maps', () => {
  const full = Object.fromEntries(Array.from({ length: MAX_MONTH_ENTRIES }, (_, i) => [`${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`, i]));
  assert.equal(canAddMonthEntry(full, '2030-01'), false);
  assert.throws(() => setMonthEntry(full, '2030-01', 0), /month entry limit/);
  assert.equal(full['2030-01'], undefined);
  const copy = { '2026-09': 10 };
  assert.equal(canAddMonthEntry(copy, '2026-09'), true);
  assert.deepEqual(setMonthEntry(copy, '2026-09', 20), { '2026-09': 20 });
});

test('export rejects invalid runtime state instead of silently exporting an empty plan', () => {
  const invalid = { ...createDefaultState('2026-09'), startingBalances: Object.fromEntries(Array.from({ length: MAX_MONTH_ENTRIES + 1 }, (_, i) => [`${2020 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`, 0])) };
  assert.throws(() => exportState(invalid), /cannot export invalid state/);
});
