# Changelog

## 10.0.0

- Limit maxzoom output to z16 for any vector source
- Remove node8 support, test with node12

## 9.1.1

- Update mapnik install to allow 4.x or 3.x

## 9.1.0

- Updated dependencies to allow install with node v10
- Add linter
- Remove test for node 4 + 6, add tests for node 8 + 10

## 9.0.1

- try/catch around more reprojection errors

## 9.0.0

- Updated to mapnik 3.7.0
- Dropped support for Windows binaries

## 8.5.0

- Clamp minzoom to z0 for all raster data
- Try/catch forward projections in raster extent method

## 8.4.2

- Clamp minzoom to z0 for vector data files under 10 MB

## 8.4.1

- Increase raster maxzoom to z25

## 8.4.0

- Upgraded to use mapnik 3.6.0

## 8.3.0

- Shorten the CSV errors when Mapnik cannot find proper column headers [#157](https://github.com/mapbox/mapnik-omnivore/issues/157)
- Introduce an internal framework for determining feature-specific zoom levels, just starting with small point datasets for now [#151](https://github.com/mapbox/mapnik-omnivore/issues/151), [#140](https://github.com/mapbox/mapnik-omnivore/issues/140)
- Update to @mapbox/mapbox-file-sniff and @mapbox/sphericalmercator packages
- Update appveyor to Node v4 and v6, no longer testing on Node v0.10.x

## 8.2.2

- Update to collect all feature's properties from GeoJSON files

## 8.2.1

- Increase raster maxzoom to z23

## 8.2.0

- Move module to @mapbox namespace
- Fixes incorrect ft + mi + km coordinate conversion for raster pixel sizes

## 8.1.0

 - Update to node v6; mapnik 3.5.14; gdal 0.9.3; and mapbox-file-sniff 0.5.2

## 8.0.0

 - Will no longer provide a recommended max zoom level less than 6

## 7.4.0

 - Adjust maxzoom limits for rasters. New fillzoom max: 21, New maxzoom: 22

## 7.3.0

 - Updated to use 3.5.0 mapnik

## 7.1.1

 - Upgraded to node-srs@1.1.0 to pull in node-gdal@0.8.0

## 7.1.0

 - Upgraded to node-gdal@0.8.0 and queue-async@1.1.1

## 7.0.0

 - Adjustments to maxzoom calculations for rasters that result in less oversampling and may yield different ranges than previous versions
 - Fixes a bug in shapefile analysis when mapnik cannot parse the file's projection information

## 6.3.2

 - Now handles more types of GeoJSON parsing errors (both datasource creation and when calling `ds.describe()`) (#128)
 - Upgraded to node-srs@1.x
 - Compatibility with latest node-mapnk@3.4.10 / Mapnik v3.0.9

## 2.2.1

 - Updated node-mapnik to 3.1.1
 - Updated node-gdal to 0.3.1
 - Updated node-srs to 0.4.5
