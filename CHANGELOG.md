
# Changelog

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
