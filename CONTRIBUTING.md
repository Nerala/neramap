# Contributing to NeraMap

Thank you for contributing to NeraMap! We welcome contributions that improve linguistic accuracy, expand geographical coverage, or refine user experience.

---

## Ways to Contribute

1. **Linguistic Data Corrections**: Correcting speaker estimates, dialect lists, taxonomic classifications, or vitality statuses.
2. **Geographical Data Refinements**: Improving regional assignments or coordinates for languages.
3. **UI / Visualization Enhancements**: Polishing D3 charts, responsiveness, or map controls.
4. **Translations**: Expanding localization beyond English and French in `js/i18n.js`.

---

## Local Development Workflow

NeraMap has no heavy build step or bundler requirement.

1. **Fork and clone the repository**:

   ```bash
   git clone https://github.com/nerala/neramap.git
   cd neramap
   ```

2. **Start a local HTTP server**:

   ```bash
   python -m http.server 8085
   ```

   Open [http://localhost:8085/](http://localhost:8085/) in your browser.

3. **Verify JavaScript syntax**:
   Before submitting changes, run:
   ```bash
   node --check js/*.js data/*.js
   ```

---

## Data Contribution Guidelines

Language entries are stored in `data/languages/{COUNTRY}.js` and must conform to the following schema:

```javascript
{
  "id": "NG-0042",
  "name": "Language Name",
  "iso": "xyz",                   // ISO 639-3 code
  "glottocode": "xyz1234",        // Glottolog identifier
  "lat": 9.54,                    // Decimal latitude
  "lng": 11.23,                   // Decimal longitude
  "family": "Niger-Congo",        // Primary linguistic phylum
  "subfamily": "Bantu > Bantoid", // Sub-branch hierarchy
  "region": "Taraba",             // Matches shapeName in geo-regions.js
  "country": "NG",                // Two-letter ISO country code
  "vitality": "stable",           // stable | vulnerable | endangered | critical
  "speakers": 150000,             // Documented L1 speakers
  "dialects": ["Dialect A"],      // Documented varieties
  "aliases": ["Alternative Name"]
}
```

### Key Data Rules

- **Territorial Snapping**: All marker coordinates (`lat`, `lng`) must fall strictly within the designated country's territory. Cross-border survey references should preserve `lat_origin` and `lng_origin`.
- **Administrative Boundary Names**: The `region` field must match the exact `shapeName` of the region in `data/geo-regions.js`.
- **RFC 7946 GeoJSON Compliance**: If editing or adding GeoJSON polygon boundaries, exterior rings must follow the counter-clockwise winding order.

---

## Localization Guidelines

NeraMap is fully localized. Never hardcode user-facing strings into HTML or JavaScript files.

- Add strings to both the `en` and `fr` dictionaries in `js/i18n.js`.
- In HTML, use `data-i18n="key.path"`.
- In JavaScript, use `NeraMap.I18n.t("key.path", params)`.

---

## Submitting a Pull Request

1. Create a feature branch: `git checkout -b feat/my-improvement`.
2. Commit with concise, descriptive messages: `git commit -m "feat: add missing dialects for Far North region"`.
3. Push to your branch and open a Pull Request against `main`.
4. Provide a clear description and screenshot/verification in the PR description.
