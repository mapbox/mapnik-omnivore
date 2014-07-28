#!/usr/bin/env bash
set -e

psql_command="psql -U postgres -d omnivoretest -c"

psql -U postgres -c "drop database if exists omnivoretest;"
psql -U postgres -c "create database omnivoretest;"
$psql_command "create extension postgis;"

$psql_command "create table onecolumn4326 ( id integer );"
$psql_command "select addgeometrycolumn('onecolumn4326', 'geometry', 4326, 'POINT', 2)"
$psql_command "create table onecolumn900913 ( id integer );"
$psql_command "select addgeometrycolumn('onecolumn900913', 'geometry', 900913, 'POINT', 2)"
$psql_command "create table twocolumn ( id integer );"
$psql_command "select addgeometrycolumn('twocolumn', 'geometrya', 4326, 'POINT', 2)"
$psql_command "select addgeometrycolumn('twocolumn', 'geometryb', 900913, 'LINESTRING', 2)"
$psql_command "create table nogeometry ( id integer, fk integer );"

$psql_command "insert into onecolumn4326 values ( 0, st_geomfromewkt('SRID=4326;POINT(0 0)') );"
$psql_command "insert into onecolumn900913 values ( 0, st_geomfromewkt('SRID=900913;POINT(3857 3857)') );"
$psql_command "insert into twocolumn values ( 0, st_geomfromewkt('SRID=4326;POINT(1 1)'), st_geomfromewkt('SRID=900913;LINESTRING(2 2,3 3)'));"
$psql_command "insert into twocolumn values ( 1, st_geomfromewkt('SRID=4326;POINT(4 4)'), st_geomfromewkt('SRID=900913;LINESTRING(5 5,6 6)'));"
$psql_command "insert into nogeometry values ( 0, 1 );"
