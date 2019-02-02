TITLE EPSE Environment Config Begin

@echo off
echo Build EPSE System

PUSHD %~dp0
echo.
echo current path is:%cd%

PUSHD tscripts
echo.
echo Ecognita Physice Simulation Engine's path is:%cd%

echo.
echo compile EPSE typescripts
call build-ts-win.bat

POPD
POPD

echo.
echo minify EPSE scripts
gulp minify

echo.
echo 「EPSE」Environment Config Finished

pause