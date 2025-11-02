# deck.gl PolygonLayer example

This repository hosts a minimal HTML page demonstrating the official deck.gl
[PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer)
example. The page loads the San Francisco zip code dataset from the deck.gl data
repository, extrudes each polygon based on population density, and renders it
with deck.gl 9.2.2.

## Running locally

Open `index.html` in a browser. All required deck.gl core and widget bundles are
stored in the `vendor/` directory so no external CDN requests are needed.

## Reset view widget

The sample registers deck.gl’s `ResetViewWidget` and places it beneath the
control panel. Use the widget to restore the camera to its initial state after
panning, zooming, or rotating around the scene.
