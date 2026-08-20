# Interaction Verification Notes

- The STEMARCADE control is present as the fourth entry in the desktop learning-workspace sidebar.
- The control renders STEM in white and ARCADE in orange, with the scan-grid SVG frame and hover animation hooks active.
- Activating the desktop control transitions to `/stemarcade`, where the Gallery Tunnel canvas and supplied “Enter ARCADE” pointer label are present.
- The live return control correctly routes back to `/`; the preview query context must be preserved so preview users return directly to their workspace rather than the onboarding view.
- A fresh live entry from `/?workspacePreview=1` reaches `/stemarcade` after recording the preview URL as the return context.
