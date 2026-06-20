# Manifest V3 Migration Assessment

## Goal

Move Web Desk from Chrome Extension Manifest V2 to Manifest V3 without mixing in a bundler rewrite or major UI refactor. The migration should preserve the current new-tab dashboard behavior while reducing deprecated extension APIs and background-page coupling.

## Current Extension Shape

Current manifest: `extension/chrome/manifest.json`

```json
{
  "manifest_version": 2,
  "chrome_url_overrides": {
    "newtab": "content/main.html"
  },
  "permissions": ["storage", "unlimitedStorage", "tabs", "chrome://favicon/"],
  "background": {
    "scripts": [
      "background.js",
      "content/scripts/lib/underscore.js",
      "storage.js"
    ]
  },
  "web_accessible_resources": ["content/main.html"]
}
```

Runtime entry points:

- `extension/chrome/content/main.html` loads RequireJS and `content/scripts/main.js`.
- `extension/chrome/background.js` is currently a placeholder.
- `extension/chrome/storage.js` lives in the background page and exposes `window.storage`.
- `extension/chrome/content/scripts/app/chrome/services.js` calls `chrome.runtime.getBackgroundPage()` to access background globals.

## APIs and Patterns That Need Migration

### 1. Background page to service worker

MV2 uses a persistent/event background page:

```json
"background": {
  "scripts": ["background.js", "content/scripts/lib/underscore.js", "storage.js"]
}
```

MV3 requires a service worker:

```json
"background": {
  "service_worker": "background.js"
}
```

Implications:

- There is no DOM/window-backed background page.
- Background globals are not long-lived in the same way.
- `chrome.runtime.getBackgroundPage()` is unavailable.
- Scripts cannot be listed as multiple background files; they must be imported/bundled or loaded via `importScripts()` from the service worker.

### 2. `chrome.runtime.getBackgroundPage()` coupling

Current file: `extension/chrome/content/scripts/app/chrome/services.js`

```js
define(function () {
    return function (name, callback) {
        chrome.runtime.getBackgroundPage(function (win) {
            callback(win[name]);
        });
    }
});
```

This will not work in MV3.

Recommended replacement options:

1. **Short-term MV3-compatible service facade:** Replace `getBackgroundPage` with `chrome.runtime.sendMessage` and route named service calls in the service worker.
2. **Better medium-term path:** Move storage logic out of background globals and into a reusable module that can run directly from the new-tab page.

Given this app is a new-tab page and most state is user-local, the medium-term path is likely simpler: remove background storage coupling and use `chrome.storage.local` or local page modules directly.

### 3. `window.storage` background global

Current file: `extension/chrome/storage.js`

The file creates a global object:

```js
})(window.storage = window.storage || {}, window._)
```

This depends on a `window` background page and Underscore being loaded globally.

MV3 service workers do not have `window`. This module should be rewritten before or during MV3 migration.

### 4. `localStorage` usage

Current storage code uses `localStorage` for:

- `items`
- `keywords`
- `sheets`
- `selectedPageId`
- `layout`

MV3 extension service workers cannot use DOM `localStorage`. New-tab pages can still use page storage, but extension state should preferably move to `chrome.storage.local` for reliability.

Recommended migration:

- Create a storage adapter with async methods.
- Initially wrap current `localStorage` behavior in the new-tab page.
- Then switch adapter implementation to `chrome.storage.local`.

Example target API:

```js
define(function () {
    return {
        getItems: function (callback) {},
        saveItems: function (items, callback) {},
        getSelectedPageId: function (callback) {},
        setSelectedPageId: function (id, callback) {}
    };
});
```

### 5. Deprecated getter/setter APIs

Current storage uses:

```js
storage.__defineGetter__('keywords', function () { ... });
storage.__defineSetter__('keywords', function (value) { ... });
```

Modern replacement:

```js
Object.defineProperty(storage, 'keywords', {
    get: function () { return keywords; },
    set: function (value) { ... }
});
```

This is not strictly MV3-specific, but it should be fixed before larger migration work.

### 6. `chrome.app.getDetails()`

Current file: `extension/chrome/content/scripts/app/helper.js`

```js
var appInfo = chrome.app.getDetails();
```

MV3-compatible replacement:

```js
var appInfo = chrome.runtime.getManifest();
```

However, this code uses `appInfo.id` to build filesystem URLs. `chrome.runtime.getManifest()` returns manifest metadata, not the extension ID. Use `chrome.runtime.id` for the ID.

Target replacement:

```js
var extensionId = chrome.runtime.id;
```

### 7. FileSystem API usage

Current file: `extension/chrome/storage.js`

```js
var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
requestFileSystem(window.PERSISTENT, null, ...)
```

This API is old and not suitable for MV3 service workers. The thumbnail persistence design should be revisited:

- If thumbnails are small: store metadata/URLs only.
- If generated blobs are required: use `chrome.storage.local`, IndexedDB, or the Origin Private File System from an extension page, not the service worker.

### 8. Manifest permissions

Current permissions after PR #4:

```json
["storage", "unlimitedStorage", "tabs", "chrome://favicon/"]
```

MV3 notes:

- `tabs` is still valid but should remain only if needed for `chrome.tabs.create` / `chrome.tabs.update`.
- `storage` is needed if moving to `chrome.storage.local`.
- `unlimitedStorage` may be unnecessary after thumbnail/file-system cleanup.
- `chrome://favicon/` may not be supported the same way in modern Chrome and should be validated manually.

### 9. `web_accessible_resources` format

MV2:

```json
"web_accessible_resources": ["content/main.html"]
```

MV3 requires object entries:

```json
"web_accessible_resources": [
  {
    "resources": ["content/main.html"],
    "matches": ["<all_urls>"]
  }
]
```

This app may not need `content/main.html` as web-accessible at all because it is loaded via `chrome_url_overrides`. Verify and remove if unnecessary.

## Recommended Migration Sequence

### PR 1: Remove background-page storage coupling

Goal: Make the new-tab page own its storage dependency instead of pulling `window.storage` from a background page.

Steps:

1. Create `extension/chrome/content/scripts/app/storage/localStorageAdapter.js`.
2. Move the necessary parts of `extension/chrome/storage.js` into an AMD module.
3. Update `extension/chrome/content/scripts/app/chrome/services.js` or call sites to use the adapter directly.
4. Keep `localStorage` for this PR to minimize behavior changes.
5. Run:

```bash
npm test
```

Manual check:

- Load unpacked extension.
- Open a new tab.
- Create/move/remove a link.
- Reload and confirm state persists.

### PR 2: Replace deprecated helper and storage APIs

Goal: Remove easy MV3 blockers without changing manifest yet.

Files:

- `extension/chrome/content/scripts/app/helper.js`
- new storage adapter from PR 1

Changes:

- Replace `chrome.app.getDetails()` with `chrome.runtime.id` / `chrome.runtime.getManifest()` as appropriate.
- Replace `__defineGetter__` / `__defineSetter__` with `Object.defineProperty`.
- Add validator checks for these deprecated patterns.

Validation:

```bash
npm test
```

### PR 3: Decide thumbnail persistence strategy

Goal: Remove or replace `requestFileSystem` usage.

Options:

1. Remove thumbnail blob persistence if unused.
2. Store thumbnails in `chrome.storage.local` if small enough.
3. Use IndexedDB from the extension page for larger blobs.

Recommended first step: audit whether `saveThumbnail` is called anywhere. If unused, remove dead code.

Command:

```bash
rg "saveThumbnail|getThumbnailUrl|requestFileSystem|webkitRequestFileSystem" extension/chrome
```

### PR 4: Convert manifest to MV3

Goal: Minimal MV3 manifest after code is no longer background-page dependent.

Target manifest shape:

```json
{
  "manifest_version": 3,
  "version": "0.0.1",
  "name": "Web-Desk",
  "description": "Some description",
  "chrome_url_overrides": {
    "newtab": "content/main.html"
  },
  "default_locale": "en",
  "permissions": ["storage", "tabs"],
  "icons": {
    "16": "icons/16.png",
    "48": "icons/48.png",
    "128": "icons/128.png"
  },
  "omnibox": { "keyword": "yeah" },
  "background": {
    "service_worker": "background.js"
  },
  "minimum_chrome_version": "88"
}
```

Adjust based on manual validation:

- Remove `background` entirely if no service worker is needed.
- Remove `web_accessible_resources` if not needed.
- Re-evaluate `chrome://favicon/` and `unlimitedStorage`.

### PR 5: Consider dependency modernization

Only after MV3 is working:

- Decide whether to keep RequireJS or move to a modern bundler.
- If moving, prefer a small esbuild/Vite migration with the same AMD entry behavior replicated carefully.
- Keep this separate from the MV3 PR.

## Validation Checklist

Run before every migration PR:

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run setup
npm test
```

Manual browser validation is required for MV3 changes:

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Load unpacked extension from `extension/chrome`.
4. Confirm no manifest errors.
5. Open a new tab.
6. Confirm Web Desk renders.
7. Add a link or group if UI path exists.
8. Drag an item.
9. Reload the new-tab page.
10. Confirm state persists.
11. Open DevTools for the new-tab page and check for console errors.
12. If a service worker exists, inspect it from `chrome://extensions` and check for errors.

## Risks

- MV3 service workers cannot replace background pages one-for-one; global `window.storage` must be removed first.
- Moving from `localStorage` to `chrome.storage.local` introduces async behavior; call sites may need restructuring.
- `chrome://favicon/` behavior may differ in modern Chrome.
- Thumbnail/file persistence may need product decisions if current behavior depends on removed APIs.
- RequireJS may still work in the new-tab page, but bundling the service worker may require separate treatment.

## Recommended Immediate Next Step

Start with a small PR that removes background-page storage coupling while preserving the current `localStorage` data format. That creates a safer path to MV3 because the new-tab page no longer depends on `chrome.runtime.getBackgroundPage()` or background `window` globals.
