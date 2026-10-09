# leaflet.traffic

Leaflet plugin that shows a traffic-only (transparent) tile layer on top of any basemap.

## Usage

```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="leaflet.traffic.js"></script>
<script>
  const map = L.map('map').setView([-6.391176, 106.798182], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.tileLayer.traffic({ language: 'id' }).addTo(map);
</script>
```

See `index.html` for a full example with an on/off switch.

## Options

| Option | Default | Description |
|---|---|---|
| `language` | `'en'` | Language code (`hl` param) |
| `threshold` | `30` | Pixel difference below this becomes transparent |
| `trafficLyrs` | `'m,traffic'` | Layer string for the traffic tile |
| `baseLyrs` | `'m'` | Layer string for the plain tile that gets subtracted |
| `subdomains` | `'0123'` | Tile server subdomains |

## Warning

This plugin uses Google's **undocumented** tile endpoint (`mt*.google.com/vt`). It is not an official API.

Consequences:

- **It may violate Google's Terms of Service.** Use at your own risk.
- **It can break or be blocked at any time**, with no notice and no support.
- It requires CORS to be allowed on the tile server; if it isn't, the layer silently fails.
- Each tile makes 2 requests and is processed on a canvas, so it is heavier than a normal overlay.

For production use, prefer an official traffic source such as the Google Maps Platform.
