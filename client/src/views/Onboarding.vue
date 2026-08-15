<template>
  <div class="splash-screen">
    <div class="center-content" :class="{ 'shift-left': showSignIn }">
      <div class="title">
      <h1 class="main-title">StudentSafe</h1>
    </div>
      <p class="desc">School safeguarding case management system</p>
      <p class="demo-banner">Portfolio demo &mdash; fictional data only, no real students are represented.</p>
    </div>

    <transition name="slide">
      <div class="sign-in-panel" v-if="showSignIn">
        <div class="login-box">
        <img :src="logo" class="logo">
        <h2>Welcome Back</h2>
        <p class="subtitle">Continue using your assigned credentials.</p>
          <form @submit.prevent="signIn">
            <div v-if="hasError" :key="errorTrigger" class="error-message"><Icon icon="line-md:alert-circle-loop" class="search-icon"/>{{ errorMessage }}</div>
            <input type="text" placeholder="Email" v-model="email" :class="{ 'input-error': hasError }"/>
            <input type="password" placeholder="Password" v-model="password" :class="{ 'input-error': hasError }" />
            <div class="forgot">
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit">Sign In</button>
          </form>

          <div class="divider">
            <span>or</span>
          </div>

          <div id="google-btn"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from '../services/api';
import logo from '@/assets/sc_logo2.png';

export default {
  data() {
    return {
      showSignIn: false,
      email: '',
      password: '',
      logo,
      errorMessage: '',
      hasError: false,
      errorTrigger: 0,
    };
  },
  mounted() {
    setTimeout(() => {
      this.showSignIn = true;
      this.$nextTick(() => {
        this.loadGoogleScript();
      });
    }, 800);
  },
  methods: {
    loadGoogleScript() {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => this.handleGoogleCallback(response),
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { type: 'standard', shape: 'pill', theme: 'outline', text: 'signin_with', size: 'large', width: 280 }
        );
      };
      document.head.appendChild(script);
    },
    async handleGoogleCallback(response) {
      try {
        const res = await api.post('/auth/google', { credential: response.credential });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const user = res.data.user;
        if (user.access_level === 0) {
          this.$router.push('/admin');
        } else if (user.access_level === 1) {
          this.$router.push('/dashboard');
        } else if (user.access_level === 4) {
          this.$router.push('/file-report');
        } else {
          this.$router.push('/dashCPO');
        }
      } catch (err) {
        this.hasError = true;
        this.errorMessage = err.response?.data?.message || 'Google sign-in failed. Try again.';
        console.error('Google login failed:', err);
      }
    },
    async signIn() {
      try{
        const res = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        })

        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))

        const user = res.data.user;
        if(user.access_level === 0){
          this.$router.push('/admin');
        } else if (user.access_level === 1) {
        this.$router.push('/dashboard');
        } else if (user.access_level === 4){
          this.$router.push('/file-report');
        } else {
        this.$router.push('/dashCPO');
        }
      } catch (err) {
        this.hasError = true;
        this.errorMessage = err.response?.data.message || 'Invalid email or password. Try again.';
        this.errorTrigger++;
        console.error('Login failed: ', err);

        this.email ='';
        this.password = '';
      }
    }
  }
}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
.splash-screen::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 30%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255, 255, 0.08), transparent 70%);
  transform: translate (-50%, -50%);
  pointer-events: none;
}
.splash-screen {
  display: flex;
  background: linear-gradient(to bottom, #001f5c, #000000);
  height: 100vh;
  width: 100%;
  overflow: hidden;
  color: white;
  font-family: 'Segoe UI', sans-serif;
  position: relative;
}

.center-content {
  flex: 1;
  text-align: left;
  padding-left: 12rem;
  transition: transform 1s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.center-content.shift-left {
  transform: translateX(-6rem);
}

.title{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.main-title{
  font-size: 6rem;
  font-weight: 700;
  margin: 0;
  line-height: 1;
  font-family: "Montserrat", sans-serif;
  text-shadow: 4px 8px 16px rgba(62, 76, 109, 0.536);
  color: #f0f2fa;
}

.desc{
  font-size: 2rem;
  font-weight: 100;
  margin-top: 0.8rem;
  opacity: 0.85;
  line-height: 1;
  font-family: "Montserrat", sans-serif;
}

.demo-banner {
  margin-top: 1.5rem;
  padding: 0.6rem 1rem;
  max-width: 32rem;
  font-size: 0.95rem;
  font-family: "Montserrat", sans-serif;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  line-height: 1.4;
}

/* Right Panel */
.sign-in-panel {
  width: 400px;
  height: 100vh;
  background-color: #f0f2fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 80%;
  color: black;
}

.login-box h2 {
  color: #0f3e8c;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 25px;
  border: none;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

input:focus{
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 62, 140, 0.2);
  transform: scale(1.02);
}

.input-error {
  border: 1px solid rgb(216, 0, 12);
  box-shadow: 0 0 5px rgba(216, 0, 12, 0.5);
}

.forgot {
  text-align: right;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.forgot a {
  color: #666;
  text-decoration: none;
  font-style: italic;
}

button {
  width: 100%;
  padding: 0.8rem;
  background-color: #0f3e8c;
  color: white;
  font-weight: bold;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}

button:hover {
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 62, 140, 0.2);
  transform: scale(1.02);
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.2rem 0;
  color: #999;
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #ddd;
}

.divider span {
  padding: 0 0.75rem;
}

#google-btn {
  display: flex;
  justify-content: center;
}

/* Slide-in animation */
.slide-enter-active {
  animation: slideIn 0.6s ease forwards;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes fadeSlide {
  from{
    opacity: 0;
    transform: translateY(-5px);
  }
  to{
    opacity: 1;
    transform: translateY(0);
  }
}

.logo{
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  margin: 0 auto 1rem auto;
  background-color: transparent;
}

.error-message {
  background-color: #f8d9db;
  color: #d8000c;
  padding: 0.6rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  text-align: left;
  animation: fadeSlide 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@media (max-width: 1024px) and (min-width: 769px){
  .center-content{
    padding-left: 4rem;
  }
  .center-content.shift-left{
    transform: translateX(-2rem);
  }
  .main-title{
    font-size: 4.5rem;
  }
  .desc{
    font-size: 1.4rem;
  }
  .sign-in-panel {
    width: 350px;
  }

  .login-box{
    width: 85%;
  }
}

@media (max-width: 768px){
  .splash-screen{
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
  }
  .center-content{
    padding: 2rem;
    text-align: center;
    align-items:center;
    justify-content: center;
    flex: none;
  }

  .center-content.shift-left{
    transform: none;
  }

  .title{
    align-items: center;
  }

  .main-title{
    font-size: 3rem;
    text-align: center;
  }

  .desc{
    font-size: 1rem;
    text-align: center;
    line-height: 1.4;
  }
  .sign-in-panel{
    width: 100%;
    height: auto;
    background: transparent;
    padding: 1rem;
  }
  .login-box{
    width: 100%;
    max-width: 400px;
    background: #f0f2fa;
    padding: 1.5rem;
    border-radius: 20px;
    box-sizing: border-box;
  }
  .logo{
    width: 64px;
    height: 64px;
  }
  #google-btn{
    width: 100%;
  }
}
</style>
