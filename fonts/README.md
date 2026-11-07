# Fonts

The web fonts the base theme names, served by the app instead of from Google
Fonts so the first paint waits on nothing outside the app's origin.
`scss/_fonts.scss` declares them; an app opts in with
`@import "@danifo/ui/scss/fonts";` after the base.

| File | Font | Source |
|---|---|---|
| `dm-sans-normal-latin*.woff2` | DM Sans v17, variable weight 400 to 700 and optical size 9 to 40 | fonts.gstatic.com/s/dmsans/v17 |
| `dm-sans-italic-latin*.woff2` | DM Sans v17 italic, 400, optical size 9 to 40 | fonts.gstatic.com/s/dmsans/v17 |
| `ibm-plex-mono-normal-latin*.woff2` | IBM Plex Mono v20, 500 | fonts.gstatic.com/s/ibmplexmono/v20 |
| `ibm-plex-mono-600-latin*.woff2` | IBM Plex Mono v20, 600 (SemiBold), which also serves bold | fonts.gstatic.com/s/ibmplexmono/v20 |

Both families are licensed under the SIL Open Font License 1.1, which allows
bundling them with software as long as the licence and the copyright notices
go with them. Those are in `OFL.txt`, which ships beside the files. The files
are the ones Google Fonts serves, unchanged.
