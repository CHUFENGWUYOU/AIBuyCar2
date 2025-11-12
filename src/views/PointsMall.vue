<template>
  <div class="points-page">
    <div class="header">
      <h2>积分商城</h2>
      <div class="balance">当前积分：<b>{{ balance }}</b></div>
    </div>

    <div class="catalog">
      <div class="item" v-for="it in catalog" :key="it.id">
        <div class="name">{{ it.name }}</div>
        <div class="cost">{{ it.cost }} 分</div>
        <button class="redeem" :disabled="balance < it.cost" @click="onRedeem(it)">
          兑换
        </button>
      </div>
    </div>

    <div class="ledger">
      <h3>积分流水</h3>
      <table>
        <thead>
          <tr><th>时间</th><th>类型</th><th>变动</th><th>余额</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in ledger" :key="row.id">
            <td>{{ fmt(row.ts) }}</td>
            <td>{{ row.kind === 'earn' ? '获取' : '兑换' }}</td>
            <td :class="row.kind === 'earn' ? 'pos' : 'neg'">
              {{ row.kind === 'earn' ? '+' : '-' }}{{ row.amount }}
            </td>
            <td>{{ row.after }}</td>
            <td>{{ row.reason }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="actions">
      <button class="ghost" @click="$router.back()">返回</button>
    </div>
  </div>
</template>

<script>
import { getPointsBalance, getCatalog, redeemItem, getPointsLedger, formatBeijingTime } from '@/services/points';

export default {
  name: 'PointsMall',
  data() {
    return {
      balance: 0,
      catalog: [],
      ledger: []
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      this.balance = getPointsBalance();
      this.catalog = getCatalog();
      this.ledger = getPointsLedger();
    },
    fmt(ts) {
      return formatBeijingTime(ts);
    },
    onRedeem(item) {
      const res = redeemItem(item.id);
      if (!res.ok) {
        alert('积分不足，无法兑换该商品');
        return;
      }
      alert(`兑换成功：${item.name}，剩余积分 ${res.balance}`);
      this.refresh();
    }
  }
};
</script>

<style scoped>
.points-page { padding: 16px; }
.header { display: flex; align-items: center; gap: 16px; }
.balance { margin-left: auto; }
.catalog { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin: 12px 0 20px; }
.item { border: 1px solid rgba(148,163,184,0.25); border-radius: 10px; padding: 12px; background: rgba(15,23,42,0.6); }
.name { font-weight: 700; margin-bottom: 6px; }
.cost { color: #9ca3af; margin-bottom: 8px; }
.redeem { padding: 8px 12px; border-radius: 10px; border: none; background: linear-gradient(135deg, #3b82f6, #22c55e); color: #fff; font-weight: 700; }
.redeem:disabled { opacity: 0.6; cursor: not-allowed; }
.ledger table { width: 100%; border-collapse: collapse; }
.ledger th, .ledger td { border: 1px solid rgba(148,163,184,0.25); padding: 8px; text-align: left; }
.pos { color: #22c55e; }
.neg { color: #ef4444; }
.actions { margin-top: 16px; }
.ghost { padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(148,163,184,0.25); background: transparent; color: #e5e7eb; }
</style>