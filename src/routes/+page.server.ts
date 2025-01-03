import { error } from '@sveltejs/kit';
import { handleLogin } from '$lib/auth';

export const actions = {
  default: async (event) => {
    const { request, locals } = event;

    // Parse form data once
    const data = await request.formData();

    // Check if the form submission is for login/signup
    const isLogin = data.get('isLogin');
    const email = data.get('email');
    const password = data.get('password');
    if (isLogin !== null || (email && password)) {
      return await handleLogin(data, locals);
    }



    throw error(400, 'Invalid form submission.');
  },
};
