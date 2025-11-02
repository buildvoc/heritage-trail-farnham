# deck.gl Playground &ndash; GeoJsonLayer replica

This repository mirrors the deck.gl playground configuration for the
[GeoJsonLayer (polygons) example](https://deck.gl/#/examples/core-layers/geojson-layer-polygons).
The page displays the official JSON definition on the left and renders the
Vancouver property value dataset on the right with MapLibre GL and deck.gl,
matching the playground layout shown in the deck.gl documentation.

## Running locally

Open `index.html` in a modern browser. The page pulls its dependencies from
CDNs:

- MapLibre GL JS 3.6.2
- deck.gl 9.2.2 and the accompanying widgets bundle
- Monaco Editor 0.45.0 for the read-only JSON panel

An internet connection is required to load the remote dataset, basemap style,
and CDN bundles.

## What you should see

A two-column layout with a configuration selector and JSON editor on the left
and an interactive 3D map on the right. The map extrudes Vancouver blocks using
their `valuePerSqm` attribute, includes MapLibre navigation controls, and shows
a tooltip with the formatted property value when you hover a block. Zoom and
compass widgets from deck.gl appear in the upper-right corner of the map.
