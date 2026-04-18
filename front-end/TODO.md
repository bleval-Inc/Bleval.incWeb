# Fix Stylesheet Warning: C:\\assets\\fonts\\google-fonts.css

## Status: 🚀 In Progress

### Plan Steps:
- [x] Understand issue: Absolute path warning despite correct relative link in index.html
- [x] Search codebase: No direct 'C:\\assets\\fonts\\google-fonts.css' found
- [x] Verify file structure: assets/fonts/ only has google-fonts.css (missing WOFF2 fonts)
- [ ] Step 1: Download required Google Fonts (Syne, DM Sans, JetBrains Mono) as WOFF2
- [ ] Step 2: Place WOFF2 files in front-end/src/assets/fonts/
- [ ] Step 3: Restart dev server (`ng serve`)
- [ ] Step 4: Test build (`ng build`) to confirm warning resolved
- [ ] Step 5: Update TODO.md ✅ Complete

### Root Cause Analysis:
- `index.html` correctly uses `<link href="assets/fonts/google-fonts.css">`
- Fonts referenced in google-fonts.css are missing → build/Vite warns about unresolved @font-face
- Absolute path likely from temp manual edit or cache

**Next Action:** Download WOFF2 fonts and add them.

