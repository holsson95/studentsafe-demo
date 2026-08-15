import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useLogout() {
  const router = useRouter();
  const showLogoutConfirm = ref(false);

  const requestLogout = () => {
    showLogoutConfirm.value = true;
  };

  const performLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
    window.location.reload();
  };

  return { showLogoutConfirm, requestLogout, performLogout };
}
