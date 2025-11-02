# deck.gl GeoJsonLayer (polygons) example

This repository hosts a static HTML page that mirrors the deck.gl website
[GeoJsonLayer polygons example](https://deck.gl/#/examples/core-layers/geojson-layer-polygons).
At runtime the page downloads the official playground JSON configuration and
instantiates the views, layers, and widgets described in that file. The
Vancouver block dataset renders as an extruded GeoJsonLayer atop the CARTO
Positron base map via MapLibre GL.

## Running locally

Open `index.html` in a modern browser. The page references deck.gl 9.2.2, its
widget bundle, and MapLibre GL 3.6.2 from the checked-in `vendor/` directory and
fetches the GeoJSON and map style from public endpoints.

## Widgets

The demo registers the deck.gl Zoom and Compass widgets defined in the
configuration. They render inside the control panel and provide quick navigation
tools for zooming and reorienting the view.
