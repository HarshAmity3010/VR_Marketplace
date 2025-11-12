Place screenshots and diagrams here and reference them from VR_Marketplace_Report.md (Annexure D).

Suggested filenames:
- login.png
- listings-grid.png
- create-form.png
- listing-detail.png
- purchase-success.png
- candid-ui.png

Tip: Keep images under ~1–2 MB for git friendliness. 

Mermaid diagram sources (auto-generated targets):
- class_diagram.mmd → class_diagram.png
- flow_login.mmd → flow_login.png
- flow_purchase.mmd → flow_purchase.png

Render diagrams (requires system deps for headless Chromium used by mermaid-cli):
1) Install missing libraries if needed (example on Ubuntu):
	- libasound2, libnss3, libxss1, fonts-liberation, libatk-bridge2.0-0, libgtk-3-0
2) Then run:
	npm run export:diagrams

If rendering fails, you can open the .mmd files in the Mermaid Live Editor and export PNG/SVG manually, then save with the expected filenames above.