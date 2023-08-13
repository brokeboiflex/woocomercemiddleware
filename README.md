# WooCommerce Middleware using Cloudflare Workers

The WooCommerce Middleware is a Cloudflare Worker that serves as a middleware for interacting with the WooCommerce REST API. It provides authentication, request handling, and response formatting for your WooCommerce API requests.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This documentation was generated using ChatGPT by OpenAI

The WooCommerce Middleware is designed to simplify and secure your interactions with the WooCommerce REST API. It handles authentication, signature generation, and response formatting, allowing you to focus on building your application while ensuring proper WooCommerce API integration.

## Features

- Authentication using OAuth 1.0a "one-legged" authentication.
- Signature generation for secure API requests.
- Automatic response formatting to JSON.
- Customizable configuration for API endpoint, consumer key, and consumer secret.
- Support for GET and POST requests.

## Getting Started

1. Clone this repository to your local machine.
2. Review the `worker.js` script to understand how the WooCommerce Middleware works.
3. Modify the script's configuration parameters based on your WooCommerce credentials, API endpoint, and allowed client URLs.
4. Deploy the Cloudflare Worker using the Cloudflare Workers dashboard.

## Usage

1. Deploy the Cloudflare Worker with your configured script.
2. Use the Cloudflare Worker URL as your API endpoint in your application.
3. Make API requests using GET or POST methods, and the middleware will handle authentication, formatting, and CORS.

## Example

Here's an example of how to make a GET request using the WooCommerce Middleware:

```javascript
const apiUrl = 'https://your-cloudflare-worker.your-subdomain.workers.dev/api/endpoint?resource=products&param1=value1&param2=value2';
const response = await fetch(apiUrl, {
  method: 'GET',
});

const data = await response.json();
console.log(data); // Process the API response
