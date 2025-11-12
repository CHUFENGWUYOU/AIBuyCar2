<template>
  <div class="login-page">
    <div class="hero">
      <img class="logo" alt="Logo" src="/bot.svg">
      <h1 class="title chroma">AIBuyCar</h1>
      <p class="subtitle">一个更懂你的ai购车软件<span class="cursor">_</span></p>
    </div>

    <form class="card" @submit.prevent="submitLogin">
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
        <label class="label" for="password">密码</label>
        <input
          id="password"
          class="input input-terminal"
          :type="showPassword ? 'text' : 'password'"
          v-model.trim="password"
          placeholder="请输入密码"
          autocomplete="current-password"
        >
        <button type="button" class="toggle" @click="showPassword = !showPassword">
          {{ showPassword ? '隐藏' : '显示' }}
        </button>
      </div>

      <div class="actions">
        <label class="remember">
          <input type="checkbox" v-model="remember"> 记住我
        </label>
        <a class="link" href="javascript:void(0)" @click.prevent="onForgot">忘记密码？</a>
      </div>

      <button class="primary btn-neon" type="submit" :disabled="submitting">
        {{ submitting ? '正在登录…' : '登录' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>

    <p class="footer">
      登录即表示同意《服务协议》和《隐私政策》 ·
      还没有账号？
      <a class="link" href="javascript:void(0)" @click.prevent="$router.push('/register')">去注册</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      account: '',
      password: '',
      remember: true,
      showPassword: false,
      submitting: false,
      errorMessage: ''
    }
  },
  methods: {
    validate() {
      if (!this.account) {
        this.errorMessage = '请输入账号'
        return false
      }
      if (!this.password) {
        this.errorMessage = '请输入密码'
        return false
      }
      this.errorMessage = ''
      return true
    },
    async submitLogin() {
      if (!this.validate()) return
      this.submitting = true
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 800))
        // 简单示例：登录成功后跳转到关于页
        this.$router.push('/chat-container')
      } catch (e) {
        this.errorMessage = '登录失败，请稍后重试'
      } finally {
        this.submitting = false
      }
    },
    onForgot() {
      this.errorMessage = '请联系管理员或稍后使用找回功能'
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
.cursor { animation: blink 1.1s steps(1,end) infinite; margin-left: 2px; }
@keyframes blink { 50% { opacity: 0; } }
.card {
  width: 100%;
  max-width: 380px;
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
