// This file defines the configuration for supported institutes. 
// Each institute has a unique code, a display name, and a URL pattern to identify the course registration page.
export const insts =[
    {
        "code": "_example", // used as an identifier and also the filename of the content script (_example.js)
        "name": "Example Institute", // full name of the institute, shown in the extension popup when the user visits a supported page
        "pattern": /demo\.saiter\.ca/i // regex pattern to match the course registration page URL.  
    },
    {
        "code": "sait", 
        "name": "Southern Alberta Institute of Technology", 
        "pattern": /sait-sust-prd-prd1-ban-ss-ssag\d+\.sait\.ca/i
    }
];