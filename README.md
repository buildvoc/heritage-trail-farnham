# deck.gl GeoJsonLayer (polygons) example

This repository hosts a static HTML page that mirrors the deck.gl website
[GeoJsonLayer polygons example](https://deck.gl/#/examples/core-layers/geojson-layer-polygons).
It loads the Vancouver block dataset, renders it with an extruded GeoJsonLayer,
and applies the Positron base map from CARTO via MapLibre GL.

## Running locally

Open `index.html` in a modern browser. The page references deck.gl 9.2.2 and its
widget bundle from the `vendor/` directory and fetches the GeoJSON and map style
from public endpoints.

## Widgets

The demo registers the deck.gl Zoom and Compass widgets. They render inside the
control panel and provide quick navigation tools for zooming and reorienting the
view.
