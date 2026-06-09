import { defineMiddleware } from 'astro:middleware';

/**
 * Security Headers Middleware
 *
 * Implements comprehensive security headers to protect against common web vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME sniffing
 * - Information disclosure
 * - Unauthorized feature access
 *
 * @see https://owasp.org/www-project-secure-headers/
 */
export const onRequest = defineMiddleware(async (_context, next) => {
    // Process the request
    const response = await next();

    // ============================================
    // Critical Security Headers
    // ============================================

    /**
     * X-Frame-Options: DENY
     * Prevents the site from being embedded in iframes, protecting against clickjacking attacks
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
     */
    response.headers.set('X-Frame-Options', 'DENY');

    /**
     * X-Content-Type-Options: nosniff
     * Prevents browsers from MIME-sniffing responses, reducing XSS risk
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
     */
    response.headers.set('X-Content-Type-Options', 'nosniff');

    /**
     * Referrer-Policy: strict-origin-when-cross-origin
     * Controls referrer information sent with requests
     * - Same-origin: Full URL
     * - Cross-origin: Only origin (protocol + domain)
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
     */
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    /**
     * Permissions-Policy
     * Controls which browser features and APIs can be used
     * Disables: geolocation, microphone, camera
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
     */
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    /**
     * X-XSS-Protection: 0
     * Disables legacy XSS Auditor (deprecated, replaced by CSP)
     * Modern browsers use CSP instead
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
     */
    response.headers.set('X-XSS-Protection', '0');

    // ============================================
    // Content Security Policy (CSP)
    // ============================================

    /**
     * Content-Security-Policy
     * Defines allowed sources for various content types
     *
     * Policy Breakdown:
     * - default-src 'self': Only load resources from same origin by default
     * - script-src: Allow scripts from self and Sanity CDN, plus inline scripts (needed for Astro)
     * - style-src: Allow styles from self, inline, and Google Fonts
     * - img-src: Allow images from self, data URIs, HTTPS sources, and blob
     * - font-src: Allow fonts from self and Google Fonts
     * - connect-src: Allow API connections to self, WordPress, and Sanity
     * - frame-src: Block all iframes
     * - object-src: Block plugins (Flash, Java, etc.)
     * - base-uri: Restrict base tag to same origin
     * - form-action: Only allow forms to submit to same origin
     * - upgrade-insecure-requests: Upgrade HTTP to HTTPS
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
     */
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.sanity.io https://*.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://olhossecos.com.br https://olhossecos.com https://cdn.sanity.io https://*.google-analytics.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));

    // ============================================
    // HTTPS and Transport Security
    // ============================================

    /**
     * Strict-Transport-Security (HSTS)
     * Forces browsers to use HTTPS for all future requests (1 year)
     * - max-age=31536000: Enforce HTTPS for 1 year
     * - includeSubDomains: Apply to all subdomains
     * - preload: Allow inclusion in browser preload lists
     *
     * Note: Only set in production to avoid HTTPS issues in development
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
     */
    if (import.meta.env.PROD) {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // ============================================
    // Additional Security Headers
    // ============================================

    /**
     * X-Powered-By removal
     * Prevents disclosure of server technology
     */
    response.headers.delete('X-Powered-By');

    /**
     * Server header
     * Generic server identifier to prevent fingerprinting
     */
    response.headers.set('Server', 'Astro');

    return response;
});
