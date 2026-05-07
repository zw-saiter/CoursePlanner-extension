# Institutes

This folder contains institution-specific parsers used by Course Planner to detect and extract course information from supported registration pages.

Community contributions are welcome.

---

## Adding Support for a New Institution

To add support for a new institution, you usually need to update two parts:

1. Add the institution configuration in `_all.js`
2. Create a new parser JavaScript file for that institution

---

## 1. Update `_all.js`

Add the institution information to `_all.js`.

The configuration should include:

- Parser file name
- Institution name
- URL pattern(s) for supported course registration pages

Example format:

- code: "sait"
- name: "SAIT"
- pattern: /reg\\.sait\\.ca\\/202610\\//i

The URL pattern is used to detect whether the current page is supported by Course Planner.

---

## 2. Create a Parser File

Create a new JavaScript file for the institution in this folder.

Example file names:

- sait.js
- ubc.js
- mru.js

The parser should read course information from the page DOM and return data in the standard Course Planner format.

You can use `_example.js` as a reference implementation.

---

## Fixing Issues for Existing Institutions

If an existing supported institution stops working because the school website changed:

- Find the related parser file
- Update the DOM selectors or extraction logic
- Keep the output format consistent
- Test the extension again on the supported course registration page

---

## Parser Guidelines

Please follow these guidelines when adding or updating a parser:

- Keep the parser focused on course extraction only
- Use DOM parsing whenever possible
- Avoid hardcoded course data
- Do not collect unrelated page information
- Do not upload or transmit extracted course information
- Return data using the standard normalized Course Planner format

---

## Testing

After adding or updating a parser:

1. Load the extension locally
2. Open a supported course registration page
3. Click the extension icon
4. Verify that the page is detected correctly
5. Extract course information
6. Open Planner and test schedule generation

---

## Privacy

All course data is processed locally in the user's browser.

Course information is not uploaded, shared, or transmitted to any server.