cinst postgresql
cinst wget

wget -OutFile .\postgis.zip http://download.osgeo.org/postgis/windows/pg92/postgis-bundle-pg92x32-2.1.3.zip

[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem')
[System.IO.Compression.ZipFile]::ExtractToDirectory('.\postgis.zip', '.\')

cd postgis-bundle-pg92x32-2.1.3
cp -force bin\* C:\PostgreSQL\bin\
cp -force gdal-data C:\PostgreSQL\gdal-data
cp -force share\* C:\PostgreSQL\share\
cp -force utils\* C:\PostgreSQL\utils\

Restart-Service PostgreSQL

mkdir $env:APPDATA\postgresql
$env:PATH = $env:PATH + ';C:\PostgreSQL\bin'
echo 'localhost:5432:*:postgres:Postgres1234' >> $env:APPDATA\postgresql\pgpass.conf

psql -U postgres -c 'create database omnivoretest'
psql -U postgres -d omnivoretest -c 'create extension postgis;'