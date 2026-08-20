# Interaction Verification Notes

- The STEMARCADE control is present as the fourth entry in the desktop learning-workspace sidebar.
- The control renders STEM in white and ARCADE in orange, with the scan-grid SVG frame and hover animation hooks active.
- Activating the desktop control transitions to `/stemarcade`, where the Gallery Tunnel canvas and supplied “Enter ARCADE” pointer label are present.
- The live return control correctly routes back to `/`; the preview query context must be preserved so preview users return directly to their workspace rather than the onboarding view.
- A fresh live entry from `/?workspacePreview=1` reaches `/stemarcade` after recording the preview URL as the return context.
- A simulated continuous 3.1-second press on the live tunnel set the deck to its revealed state and faded the tunnel layer as intended.
- The revealed live deck displays the four STEM concept cards; a wheel interaction advances the coverflow position using the supplied card transition mechanics.
- A live touch-style three-second hold revealed the deck, and a subsequent touch swipe advanced its active coverflow card.
- The visible return control still restored the original learning-workspace preview route after the touch-style deck interaction.
- In a 375px visual mobile viewport, the live touch-pointer hold revealed the deck, a touch swipe advanced its coverflow state, and the return control restored `/?workspacePreview=1` with the workspace visible.
- The updated live STEMARCADE route exposes the requested Physics, Chemistry, Math, and Coding deck labels; the cursor overlay is being checked directly against the canvas-adjacent label element.
