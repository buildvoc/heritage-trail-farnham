## This is an example of a walking route in Farnham Surrey England

see offical council webpage [Farnham Heritage Trail](https://www.farnham.gov.uk/things-to-do/getting-outside/walks-and-countryside/heritagetrail)

Blog: https://bertt.wordpress.com/2025/01/10/creating-interactive-3d-hiking-map/

Live demo: [https://buildvoc.github.io/heritage-trail-farnham/](https://buildvoc.github.io/heritage-trail-farnham/)

![Terrain-Building-height updates-14](https://github.com/user-attachments/assets/1d4c111d-4e67-4b2f-bcfb-5c9b21167da5)

### Local pic2bim credentials

The main map loads a sample building footprint from
[`osm_st_andrews_church_osm_2025_10_31.geojson`](https://github.com/buildvoc/heritage-trail-farnham/blob/main/osm_st_andrews_church_osm_2025_10_31.geojson),
ensuring the primary window immediately renders an extruded wireframe polygon
using deck.gl’s
[`PolygonLayer`](https://deck.gl/docs/api-reference/layers/polygon-layer#wireframe)
configuration. To enable the optional pic2bim building lookup integration you
must provide your own credentials. Copy `pic2bim-credentials.sample.js` to
`pic2bim-credentials.local.js` and replace the placeholder values with your
username and password. The `.local.js` file is ignored by git so the secrets are
never committed to the repository.

The UI also exposes a built-in "Reset view" button in the on-map controls so
you can restore the camera to its initial orientation while experimenting with
the various controller modes—no external widget dependencies required.

### Create a Route of your Heritage Trail

After you have created your route on [Active Travel Scheme Sketcher](https://plan.activetravelengland.gov.uk/index.html)
