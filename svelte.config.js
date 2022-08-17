import 'dotenv/config';

// you might need these if working behind an http proxy
if (process.env.NODE_ENV !== 'production') {
	delete process.env.https_proxy;
	delete process.env.HTTPS_PROXY;
	delete process.env.http_proxy;
	delete process.env.HTTP_PROXY;
	delete process.env._proxy;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {},
};

export default config;
