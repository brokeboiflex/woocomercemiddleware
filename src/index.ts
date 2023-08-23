/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import Crypto from 'crypto-js';

function generateRandomNonce(length) {
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let nonce = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * charset.length);
		nonce += charset.charAt(randomIndex);
	}
	return nonce;
}

const handler: ExportedHandler = {
	async fetch(request, env) {
		async function MethodNotAllowed(request) {
			return new Response(`Method ${request.method} not allowed.`, {
				status: 405,
				headers: {
					Allow: 'GET, POST',
				},
			});
		}

		async function WrongContentType(request) {
			return new Response(`Wrong content-type: ${request.headers.get('content-type')}, only 'application/json' is supported  `, {
				status: 405,
				headers: {
					Allow: 'GET, POST',
				},
			});
		}

		const url = new URL(request.url);
		const resource = url.searchParams.get('resource');

		// WooCommerce request variables
		const apiUrl = `${env.WC_URL}/wp-json/wc/v3/${resource}`;
		const nonce = generateRandomNonce(32);
		const timestamp = Math.floor(Date.now() / 1000).toString();
		// Combine all the OAuth parameters as a plain object
		const oauthParams = {
			...{
				oauth_consumer_key: env.WC_CONSUMER_KEY,
				oauth_nonce: nonce,
				oauth_signature_method: 'HMAC-SHA1',
				oauth_timestamp: timestamp,
				oauth_version: '1.0',
			},
		};
		const method = request.method;

		// Concatenate all the parameters and percent-encode them
		const generateParameterString = (parameters: any) =>
			Object.keys(parameters)
				.sort()
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
				.join('&');

		// Generate the OAuth header
		const generateOauthHeader = (parameters: any) =>
			`OAuth oauth_consumer_key="${encodeURIComponent(env.WC_CONSUMER_KEY)}", oauth_nonce="${encodeURIComponent(
				nonce
			)}", oauth_signature="${encodeURIComponent(
				Crypto.enc.Base64.stringify(
					// Generate the OAuth signature using HMAC-SHA1 algorithm
					Crypto.HmacSHA1(
						// Create the signature base string
						`${method}&${encodeURIComponent(apiUrl)}&${encodeURIComponent(generateParameterString(parameters))}`,
						`${encodeURIComponent(env.WC_CONSUMER_SECRET)}&`
					)
				)
			)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${encodeURIComponent(timestamp)}", oauth_version="1.0"`;

		// Only GET requests work with this proxy.
		if (method === 'GET') {
			const queryParams = Array.from(url.searchParams.entries()).filter((qp) => qp[0] !== 'resource');
			const queryParamsObject = queryParams.reduce((acc, [key, value]) => {
				if (value !== '') {
					acc[key] = value;
				}
				return acc;
			}, {});

			// Combine parameters
			const oauthHeader = generateOauthHeader({ ...oauthParams, ...queryParamsObject });

			const parameterdURL = `${apiUrl}${
				queryParams.length > 0
					? '?' +
					  Object.keys(queryParamsObject)
							.sort()
							.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParamsObject[key])}`)
							.join('&')
					: ''
			}`;

			// Make a GET request using fetch and include the Authorization header
			const response = await fetch(parameterdURL, {
				method: 'GET',
				headers: {
					Authorization: oauthHeader,
				},
			});

			const data = await response.json();

			// Create a new Response with the fetched data and return it
			return new Response(JSON.stringify(data), {
				status: response.status,
				headers: {
					// Add any required headers for the response here
					'Content-Type': 'application/json', // Adjust the content type based on your API response
					'Access-Control-Allow-Origin': 'http://localhost:3000', // Replace with your client's URL
					'Access-Control-Allow-Methods': 'GET, POST',
					'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
				},
			});
		} else if (method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': 'http://localhost:3000', // Replace with your client's URL
					'Access-Control-Allow-Methods': 'GET, POST', // Allowed methods
					'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
				},
			});
		} else if (method === 'POST') {
			const contentType = request.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				const requestData = await request.json();
				const oauthHeader = generateOauthHeader(oauthParams);

				const response = await fetch(apiUrl, {
					method: 'POST',
					headers: {
						Authorization: oauthHeader,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestData),
				});

				const responseData = await response.json();

				return new Response(JSON.stringify(responseData), {
					status: response.status,
					headers: {
						// Add any required headers for the response here
						'Content-Type': 'application/json', // Adjust the content type based on your API response
						'Access-Control-Allow-Origin': 'http://localhost:3000', // Replace with your client's URL
						'Access-Control-Allow-Methods': 'GET, POST',
						'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
					},
				});
			} else return WrongContentType(request);
		} else return MethodNotAllowed(request);
	},
};

export default handler;
