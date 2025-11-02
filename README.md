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

## React example with deck.gl widgets

If you need a React-based reference that already integrates the deck.gl widget
APIs, the deck.gl project publishes a Vite starter in
[`examples/get-started/react/basic`](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/basic).
The `app.jsx` entry point imports `CompassWidget` from `@deck.gl/react` and
renders it alongside the `DeckGL` component so you can see how widgets mount in
a React tree.

To deploy the sample locally:

1. Download or clone the `examples/get-started/react/basic` directory.
2. Install dependencies with `npm install` (or `yarn`).
3. Start the dev server with `npm start` for live reloading during development.
4. Build the production bundle with `npm run build` when you are ready to
   deploy the compiled assets to static hosting.
