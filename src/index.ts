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
					Allow: 'GET',
				},
			});
		}
		// Only GET requests work with this proxy.
		if (request.method === 'GET') {
			const url = new URL(request.url);
			const queryParams = Array.from(url.searchParams.entries()).filter((qp) => qp[0] !== 'resource');
			const queryParamsObject = queryParams.reduce((acc, [key, value]) => {
				if (value !== '') {
					acc[key] = value;
				}
				return acc;
			}, {});

			const resource = url.searchParams.get('resource');

			const apiUrl = `${env.WC_URL}/wp-json/wc/v3/${resource}`;
			const nonce = generateRandomNonce(32);
			const timestamp = Math.floor(Date.now() / 1000).toString();

			// Combine all the OAuth parameters as a plain object
			const params = {
				...queryParamsObject,
				...{
					oauth_consumer_key: env.WC_CONSUMER_KEY,
					oauth_nonce: nonce,
					oauth_signature_method: 'HMAC-SHA1',
					oauth_timestamp: timestamp,
					oauth_version: '1.0',
				},
			};

			// Concatenate all the parameters and percent-encode them
			const parameterString = Object.keys(params)
				.sort()
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
				.join('&');
			// Create the signature base string
			const method = request.method.toUpperCase();
			const signatureBaseString = `${method}&${encodeURIComponent(apiUrl)}&${encodeURIComponent(parameterString)}`;

			// Generate the OAuth signature using HMAC-SHA1 algorithm
			const signature = Crypto.HmacSHA1(signatureBaseString, `${encodeURIComponent(env.WC_CONSUMER_SECRET)}&`);
			const oauthSignature = Crypto.enc.Base64.stringify(signature);

			// Generate the OAuth header
			const oauthHeader = `OAuth oauth_consumer_key="${encodeURIComponent(env.WC_CONSUMER_KEY)}", oauth_nonce="${encodeURIComponent(
				nonce
			)}", oauth_signature="${encodeURIComponent(
				oauthSignature
			)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${encodeURIComponent(timestamp)}", oauth_version="1.0"`;

			const parameterdURL = `${apiUrl}${
				queryParams.length > 0
					? '?' +
					  Object.keys(queryParamsObject)
							.sort()
							.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParamsObject[key])}`)
							.join('&')
					: ''
			}`;
			console.log(parameterdURL);

			// Make a GET request using fetch and include the Authorization header
			const response = await fetch(parameterdURL, {
				method: 'GET',
				headers: {
					Authorization: oauthHeader,
				},
			});

			// Get the response body as text or JSON, depending on the API response type
			const data = await response.json(); // Use response.text() if the response is not in JSON format

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
		} else if (request.method === 'POST') {
			// Will work on it when I need it ;)
		} else return MethodNotAllowed(request);
	},
};

export default handler;
