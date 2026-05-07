// This file defines the configuration for supported institutes. 
// Each institute has a unique code, a display name, and a URL pattern to identify the course registration page.
/**
 * @typedef {Object} Institute
 * @property {string} code - Identifier and parser filename (e.g., 'sait' -> 'sait.js')
 * @property {string} name - Display name for the UI
 * @property {RegExp} pattern - Regex to match the course registration URL
 * @property {string} [homepage] - (Optional) Direct link to the registration portal
 */

/** @type {Institute[]} */
export const insts = [
    {
        code: "_example",
        name: "Example Institute",
        pattern: /demo\.saiter\.ca(\/|$)/i,
        homepage: "https://demo.saiter.ca/"
    },
    {
        code: "sait",
        name: "Southern Alberta Institute of Technology",
        pattern: /\.sait\.ca\/StudentRegistration/i,
        homepage: "https://www.mysait.ca/"
    }
];

/**
 * Helper function to find an institute by URL
 * @param {string} url 
 * @returns {Institute|undefined}
 */
export const findInstByUrl = (url) => insts.find(inst => inst.pattern.test(url));