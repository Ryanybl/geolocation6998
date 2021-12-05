# cwp-epu-data-platform
Columbia World Projects Energy for Productive Use Data Platform

Live page: https://qsel.columbia.edu/cwp-epu-data-platform/

## Data sources
All data are currently stored within the [ModiLab organization](https://redivis.com/ModiLab/datasets) on the [Columbia Data Platform](https://redivis.com/Columbia). Note that these datasets may not be visible to you unless you are logged in and have been granted access.

## Development
### Installation
- Install [Node.js](https://nodejs.org/)
- Navigate to this directory in your terminal, and run `npm start`
- Open a browser and navigate to: `http://localhost:8080`

### Contributing
- All application files are located in the [`./src`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src) directory
- To modify how layers are displayed, see [Configuration](#configuration) below

### Deployment
- Assets will automatically be built, minified, and saved to `/dist` on every commit (via a git pre-commit hook)
- Pushing to the `master` branch will automatically trigger a deployment to the live Github Pages site

## Configuration

To customize the [Explore data](https://qsel.columbia.edu/cwp-epu-data-platform/), [Map](https://qsel.columbia.edu/cwp-epu-data-platform/map), [Download](https://qsel.columbia.edu/cwp-epu-data-platform/download), and [About](https://qsel.columbia.edu/cwp-epu-data-platform/about) pages, you can edit the configuration options in the [`./src/config`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config) directory.

### Explore data

The [Explore data](https://qsel.columbia.edu/cwp-epu-data-platform) homepage organizes administrative regions into sections, one for each country. The content responds to configuration of [Admin polygons](#admin-polygons).

#### Countries
To add, remove or update the countries shown, add an appropriate **VectorSource** (via the [Admin polygons](#admin-polygons) configuration below) for the country's regions, and set its the `options.label` attribute to the country name.

To update the images shown above the section, you can modify the **imagesByRegionGroup** object in [`./src/config/images`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/baseMaps.js), which maps a country name to an object specifying the url (`src`), alternate text (`alt`), and link to the map (`href`) for that country.

The `src` property of a country specification should point to an image in the [./assets](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/assets) directory.

### Map
To configure the [Map](https://qsel.columbia.edu/cwp-epu-data-platform/map) page, you can customize the available options and styles of [base maps](#base-maps), [pre-existing maps and data](#pre-existing-maps-and-data), [landscape predictions](#landscape-predictions), [landscape observations](#landscape-observations), and [admin polygons](#admin-polygons).

#### Base maps
To add, remove, or update available base maps, you can modify the exported array **baseMaps** in [`./src/config/baseMaps`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/baseMaps.js), each of which is an **options** object specifying a base map's display name and style.

##### Parameters
**options** [`(Object)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

| Name | Description |
| --- | --- |
| **options.name** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | The name displayed on each base map selector |
| **options.mapboxStyle** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | A URL referencing to the base map's Mapbox style. To use a style from the Mapbox API, you can use a URL of the form `mapbox://styles/:owner/:style`, where `:owner` is your Mapbox account name and `:style` is the style ID. <br><br> More details about Mapbox styles can are described in the [Mapbox Style Specification](https://mapbox.com/mapbox-gl-style-spec/). |
| **options.isDefault** [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) <br> *default: false* | If `true`, this base map will be selected when the page loads |

#### Pre-existing maps and data
To add, remove, or update the available vector layers, you can modify the exported array **vectors** in [`./src/config/vectors`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/vectors.js), each of which is a **VectorSource** class specifying the styling and data shown in the vector layer.
```js
new VectorSource(options)
```

##### Parameters
**options** [`(Object)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

| Name | Description |
| --- | --- |
| **options.name** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | The name displayed on each vector layer toggle |
| **options.label** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | The grouping label (e.g., country name) at the top of each subsection of vector layers. |
| **options.isDefault** [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) <br> *default: false* | If `true`, this vector layer will be selected when the page loads |
| **options.isGeobuf** [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) <br> *default: false* | If `true`, this vector layer will be decoded via [geobuf](https://github.com/mapbox/geobuf) |
| **options.tableIdentifier** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | A string referencing the Redivis table containing the layer geometry information and metadata. Use a reference of the form `:ownerName.:datasetIdentifier.:tableIdentifier`, where `:ownerName` is the Redivis organization hosting the dataset, `:datasetIdentifier` is the dataset reference, and `:tableIdentifier` is the table reference. <br><br> More details about referencing Redivis resources can be found in the [Redivis API Docs](https://apidocs.redivis.com/referencing-resources#general-structure). |
| **options.geoVariables** [`Array<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | Variable(s) containing geographic coordinates, to be parsed via `options.getGeometry`. Each variable must have a `name` property. |
| **options.getGeometry** [`Function`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) <br> *default: (value) => JSON.parse(value)* | Called on each row in the source table (set via `options.tableIdentifier`), this function inputs an ordered array of values for each variable specified in `options.geoVariables`, and returns an object specifying the feature represented by that row. <br><br> Note that, by default, the value of _only_ the first variable of `options.geoVariables` is passed to the function; using multiple variables to specify the geometry requires a custom function. <br><br> Vectors are mapped using [Mapbox's GeoJSONSource](https://docs.mapbox.com/mapbox-gl-js/api/sources/#geojsonsource), which builds a 'FeatureCollection' of [GeoJSON](https://geojson.org) features.  |
| **options.filterVariables** [`Array<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | Variable(s) containing values to filter on. Each variable must have a `name` property. Filtering UI is currently limited to the variable specified in `options.legendVariable`|
| **options.metadataVariables** [`Array<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | Variable(s) containing values to show in a popover of each feature in the layer. Each variable must have a `name` property. |
| **options.legendVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing values to show in the layer's legend. The variable must have a `name` property. Legend colors can be specified via `options.mapboxLayerOptions`.|
| **options.mapboxSourceType** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | A string referencing the type of [Mapbox Source](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/) used to populate the layer data. Must be one of `vector`, `raster`, `raster-dem`, `geojson`, `image`, `video`. |
| **options.mapboxLayerType** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | A string referencing the type of [Mapbox Layer](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/) used to draw the layer features. Must be one of `background`, `fill`, `line`, `symbol`, `raster`, `circle`, `fill-extrusion`, `heatmap`, `hillshade`. |
| **options.mapboxLayerOptions** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | An object which configures the appearance of the layer of a given type, e.g., [Line](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line). May have `layout` and `paint` objects specifying different properties, usually prefixed with the layer type, e.g., [`line-color`](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#paint-line-line-color). <br><br> Note that conditional styling can be based on variable values using [match](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match) or other [Mapbox expressions](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/) |

##### Simplification Levels
To add simplification levels to a vector layer, you can update the **simplificationLevels** array in [`./src/config/vectors`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/vectors.js). This will add a simplified vector layer corresponding to each number in the array, where the `options.geoVariables` specification as `[{ name: 'geoBuf_simplified_[LEVEL]' }]` where **LEVEL** is each number in the array (e.g., `1`, `10`, `50` percent). You must have a variable with the appropriate geometric information in the source table with the appropriate name.

#### Landscape predictions
To add, remove, or update the available raster layers, you can modify the exported array **rasterGroups** in [`./src/config/rasterGroups`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/rasterGroups.js), each of which is a **RasterSourceGroup** class specifying a single table where each row represents a distinct raster layer.

```js
new RasterSourceGroup(options)
```

##### Parameters
**options** [`(Object)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

| Name | Description |
| --- | --- |
| **options.label** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | The grouping label (e.g., country name) at the top of each subsection of raster layers. |
| **options.tableIdentifier** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | A string referencing the Redivis table containing the layer geometry information and metadata. Use a reference of the form `:ownerName.:datasetIdentifier.:tableIdentifier`, where `:ownerName` is the Redivis organization hosting the dataset, `:datasetIdentifier` is the dataset reference, and `:tableIdentifier` is the table reference. <br><br> More details about referencing Redivis resources can be found in the [Redivis API Docs](https://apidocs.redivis.com/referencing-resources#general-structure). |
| **options.mapboxIdVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing the Mapbox [Raster Tiles API](https://docs.mapbox.com/api/maps/#raster-tiles) `tileset_id`. The variable must have a `name` property. <br><br> You can find upload and configure raster tilesets via [Mapbox Studio](https://studio.mapbox.com/tilesets/).|
| **options.minNativeZoomVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing the minimum zoom value (most zoomed-out) available for the raster layer. The variable must have a `name` property. Zoom levels can be between 0 and 22. |
| **options.maxNativeZoomVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing the maximum zoom value (most zoomed-in) available for the raster layer. The variable must have a `name` property. Zoom levels can be between 0 and 22. |
| **options.boundingBoxVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing the bounding box values for the raster layer. The variable must have a `name` property. Bounding box value should be an ordered array of numbers: [SW corner longitude, SW corner latitude, NE corner longitude, NE corner latitude]. |
| **options.nameVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing the name displayed on the raster layer. The variable must have a `name` property. |
| **options.customNamesByMapboxId** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | An object that maps raster layer mapboxIds (from `options.mapboxIdVariable`) to a string, which represents the name that should be shown on the layer toggle instead of the value specified by `options.nameVariable`. |
| **options.customLegendsByMapboxId** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | An object that maps raster layer mapboxIds (from `options.mapboxIdVariable`) to an object, specifying a `type: 'categorical'` legend with `categories` array containing legend blocks, or a `type: 'continuous'` legend with `min` and `max` blocks. |

##### Opacity

Raster opacities can be controlled by users to help view multiple raster layers more clearly.

You can modify the initial opacity when showing a landscape prediction raster by updating the `DEFAULT_RASTER_OPACITY` constant in [`./src/config/constants`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/constants.js).

#### Landscape observations
To add, remove, or update the available vector layers, you can modify the exported array **observationVectors** in [`./src/config/observationVectors`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/observationVectors.js), each of which is a **VectorSource** class specifying the styling and data shown in the vector layer.

Landscape observation layers use the same vector configuration described above in [Pre-existing maps and data](#pre-existing-maps-and-data).

Note that, currently, the landscape observation configuration takes advantage of custom geometry parsing specified in **options.getGeometry** and a static legend specification in **options.legend**.

#### Admin polygons
To add, remove, or update the available vector layers, you can modify the exported array **adminVectorSpecs** in [`./src/config/adminVectors`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/adminVectors.js), each of which is a **VectorSource** class specifying the styling and data shown in the vector layer.

##### Simplification Levels
To add simplification levels to a vector layer, you can update the **simplificationLevels** array in [`./src/config/adminVectors`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/adminVectors.js). This will add a simplified vector layer corresponding to each number in the array, where the `options.geoVariables` specification as `[{ name: 'geoBuf_simplified_[LEVEL]' }]` where **LEVEL** is each number in the array (e.g., `1`, `10`, `50` percent). You must have a variable with the appropriate geometric information in the source table with the appropriate name.

##### Additional Parameters

Landscape observation layers use a similar vector configuration described above in [Pre-existing maps and data](#pre-existing-maps-and-data), with a few additional specifications shown below:

| Name | Description |
| --- | --- |
| **options.hierarchyIndex** [`number`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | An integer describing the hierarchical level of the administrative region. Lower numbers are broader regions, higher numbers are more granular regions. This parameter is used to organize the region menus on the Explore data hompage. |
| **options.showOnHome** [`boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | If `true`, this administrative region will be shown in the menus on the homepage. We currently only support regions a hierarchy (`options.hierarchyIndex`) of `0` or `1`.   |
| **options.regionNameVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing values for the region names, to show in the menus on the homepage. The variable must have a `name` property. |
| **options.regionParentVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing values for the region parent names, to group more granular regions into broader categories. The variable must have a `name` property. |
| **options.regionBoundingBoxVariable** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | Variable containing values for the region bounding box. The variable must have a `name` property. Bounding box value should be an ordered array of numbers: [SW corner longitude, SW corner latitude, NE corner longitude, NE corner latitude].|
| **options.mapboxLayerType** [`Array<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | An array of strings referencing multiple types of [Mapbox Layer](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/) used to draw features in multiple layers. Each value must be one of `background`, `fill`, `line`, `symbol`, `raster`, `circle`, `fill-extrusion`, `heatmap`, `hillshade`.|
| **options.mapboxLayerOptions** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | An object which configures the appearance of each layer of a given type, e.g., [Line](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#line). Each layer type (e.g., `line`) is an object which may have `layout` and `paint` objects specifying different properties, usually prefixed with the layer type, e.g., [`line-color`](https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#paint-line-line-color). <br><br> Note that conditional styling can be based on variable values using [match](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#match) or other [Mapbox expressions](https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/) |

Note that `options.mapboxLayerType` can be an [`Array<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) to specify multiple layers (e.g., a `line` for a border *and* a `fill` for the interior). If you specify an array, ensure that `options.mapboxLayerOptions` nests layer specifications by layer type.

##### Opacity

Vector opacities for admin polygons are set lower to allow viewing of base maps and other features, and raised slightly to highlight selected admin regions.

You can modify the base and selected region vector opacities by updating the `SELECTED_ADMIN_VECTOR_OPACITY` and `DEFAULT_ADMIN_VECTOR_OPACITY` constants in [`./src/config/constants`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/constants.js).

### Download
To add, remove, or update links on the [Download](https://qsel.columbia.edu/cwp-epu-data-platform/download) page, you can modify the exported array **downloads** in [`./src/config/downloads`](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/downloads.js), each of which is an **options** object specifying a download's display name and link.

##### Parameters
**options** [`(Object)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

| Name | Description |
| --- | --- |
| **options.label** [`string`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String) | The label displayed on download section |
| **options.links** [`Object`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | An array of links, each specified by an object with the display name (`name`) and url (`href`) of the link. |

### About
To update the content on the [About](https://qsel.columbia.edu/cwp-epu-data-platform/about) page, you can edit the [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) in [./src/config/about.md](https://github.com/SEL-Columbia/cwp-epu-data-platform/tree/master/src/config/about.md).

# geolocation6998
