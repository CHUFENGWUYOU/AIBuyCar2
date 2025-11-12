<template>
  <div class="login-page">
    <div class="hero">
      <img class="logo" alt="Logo" src="/bot.svg">
      <h1 class="title chroma">AIBuyCar</h1>
      <p class="subtitle">创建你的账户，开启智能购车</p>
    </div>

    <form class="card" @submit.prevent="submitRegister">

      <div class="field">
        <label class="label" for="account">账号</label>
        <input
          id="account"
          class="input input-terminal"
          type="text"
          v-model.trim="account"
          placeholder="请输入用户名"
          autocomplete="username"
        >
      </div>

      <div class="field">
        <label class="label" for="nickname">昵称</label>
        <input
          id="nickname"
          class="input input-terminal"
          type="text"
          v-model.trim="nickname"
          placeholder="你的昵称"
          autocomplete="nickname"
        >
      </div>

      <div class="field">
        <label class="label" for="name">姓名</label>
        <input
          id="name"
          class="input input-terminal"
          type="text"
          v-model.trim="name"
          placeholder="你的姓名"
          autocomplete="name"
        >
      </div>
      <div class="field">
        <label class="label" for="telephone">手机号</label>
        <input
          id="telephone"
          class="input input-terminal"
          type="text"
          v-model.trim="telephone"
          placeholder="请输入手机号"
          autocomplete="telephone"
        >
      </div>

      <div class="field">
        <label class="label" for="email">邮箱</label>
        <input
          id="email"
          class="input input-terminal"
          type="email"
          v-model.trim="email"
          placeholder="name@example.com"
          autocomplete="email"
        >
      </div>
      <div class="field">
        <label class="label" for="password">密码</label>
        <input
          id="password"
          class="input input-terminal"
          :type="showPassword ? 'text' : 'password'"
          v-model.trim="password"
          placeholder="至少 6 位，包含字母与数字"
          autocomplete="new-password"
        >
        <button type="button" class="toggle" @click="showPassword = !showPassword">
          {{ showPassword ? '隐藏' : '显示' }}
        </button>
      </div>
      <div class="field">
        <label class="label" for="confirm">确认密码</label>
        <input
          id="confirm"
          class="input input-terminal"
          :type="showConfirm ? 'text' : 'password'"
          v-model.trim="confirm"
          placeholder="再次输入密码"
          autocomplete="new-password"
        >
        <button type="button" class="toggle" @click="showConfirm = !showConfirm">
          {{ showConfirm ? '隐藏' : '显示' }}
        </button>
      </div>

      <div class="actions">
        <label class="remember">
          <input type="checkbox" v-model="agree"> 我已阅读并同意《服务协议》和《隐私政策》
        </label>
      </div>

      <button class="primary btn-neon" type="submit" :disabled="submitting">
        {{ submitting ? '正在创建…' : '注册' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>

    <p class="footer">
      已有账号？
      <a class="link" href="javascript:void(0)" @click.prevent="$router.push('/')">去登录</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      account: '',
      nickname: '',
      name: '',
      telephone: '',
      email: '',
      password: '',
      confirm: '',
      agree: false,
      showPassword: false,
      showConfirm: false,
      submitting: false,
      errorMessage: ''
    }
  },
  methods: {
    validate() {
      if (!this.nickname) {
        this.errorMessage = '请输入昵称'
        return false
      }
      if (!this.email) {
        this.errorMessage = '请输入邮箱'
        return false
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(this.email)) {
        this.errorMessage = '邮箱格式不正确'
        return false
      }
      if (!this.password || this.password.length < 6) {
        this.errorMessage = '密码至少 6 位'
        return false
      }
      if (this.password !== this.confirm) {
        this.errorMessage = '两次输入的密码不一致'
        return false
      }
      if (!this.agree) {
        this.errorMessage = '请先同意协议'
        return false
      }
      this.errorMessage = ''
      return true
    },
    async submitRegister() {
      if (!this.validate()) return
      this.submitting = true
      try {
        // 模拟注册请求
        await new Promise(resolve => setTimeout(resolve, 900))
        // 注册成功后返回登录页
        this.$router.push('/')
      } catch (e) {
        this.errorMessage = '注册失败，请稍后重试'
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: radial-gradient(1200px 600px at 50% -10%, rgba(0,255,156,0.15), transparent 60%),
              radial-gradient(800px 400px at 100% 10%, rgba(56,189,248,0.12), transparent 60%);
}
.hero {
  text-align: center;
  margin-bottom: 24px;
}
.logo {
  width: 68px;
  height: 68px;
  opacity: 0.95;
  filter: drop-shadow(0 0 14px rgba(0,255,156,0.35));
}
.title {
  margin: 12px 0 4px;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: var(--text);
}
.title.chroma {
  background-image: linear-gradient(90deg, var(--neon), var(--neon-2), var(--amber), var(--neon));
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: chromaShift 6s linear infinite;
  text-shadow: none;
}
@keyframes chromaShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}
.card {
  width: 100%;
  max-width: 420px;
  background: rgba(0, 17, 13, 0.6);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(0,255,156,0.18);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35), 0 0 24px rgba(0,255,156,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
}
.field {
  position: relative;
  margin-bottom: 14px;
}
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: var(--muted);
}
.input {
  width: 100%;
  box-sizing: border-box;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(148,163,184,0.18);
  background: rgba(0, 17, 13, 0.75);
  color: var(--text);
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.input::placeholder {
  color: #1c6a4f;
}
.input:focus {
  border-color: var(--neon);
  box-shadow: 0 0 0 3px rgba(0,255,156,0.18);
  background: rgba(0, 17, 13, 0.9);
}
.toggle {
  position: absolute;
  right: 10px;
  top: 32px;
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
  background: transparent;
  color: var(--muted);
  border: none;
  cursor: pointer;
}
.toggle:hover {
  color: var(--text);
}
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 16px;
  font-size: 13px;
  color: var(--muted);
}
.remember {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.link {
  color: var(--neon-2);
  text-decoration: none;
  cursor: pointer;
}
.link:hover {
  text-decoration: underline;
}
.primary {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--neon), var(--neon-2));
  color: #00110d;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform .08s ease, filter .2s ease, opacity .2s ease;
}
.primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.primary:not(:disabled):active {
  transform: translateY(1px);
  filter: brightness(0.95);
}
.error {
  margin-top: 12px;
  color: var(--error);
  font-size: 13px;
}
.footer {
  margin-top: 14px;
  font-size: 12px;
  color: var(--muted);
}
</style>


