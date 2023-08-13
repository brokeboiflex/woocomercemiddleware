<!-- Documentation generated using ChatGPT by OpenAI -->

# WooCommerce Middleware using Cloudflare Workers

The WooCommerce Middleware is a Cloudflare Worker that serves as a middleware for interacting with the WooCommerce REST API. It provides authentication, request handling, and response formatting for your WooCommerce API requests.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Example](#example)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The WooCommerce Middleware is designed to simplify and secure your interactions with the WooCommerce REST API. It handles authentication, signature generation, and response formatting, allowing you to focus on building your application while ensuring proper WooCommerce API integration.

## Features

- Authentication using OAuth 1.0a "one-legged" authentication.
- Signature generation for secure API requests.
- Automatic response formatting to JSON.
- Customizable configuration for API endpoint, consumer key, and consumer secret.
- Support for GET and POST requests.

## Getting Started

1. Clone this repository to your local machine.
2. Modify the configuration in the `worker.js` script to match your WooCommerce credentials, API endpoint, and allowed client URLs.
3. Deploy the Cloudflare Worker using the Cloudflare Workers dashboard.

## Configuration

In the `worker.js` script, you'll find a section to configure your WooCommerce credentials, API endpoint, and allowed client URLs:

```javascript
// WooCommerce API configuration
const apiUrl = `${env.WC_URL}/wp-json/wc/v3`;
const consumerKey = env.WC_CONSUMER_KEY;
const consumerSecret = env.WC_CONSUMER_SECRET;

// Allowed client URLs for CORS
const allowedClientURLs = [
  'http://localhost:3000', // Replace with your client's URL
];
