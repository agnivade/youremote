#!/bin/bash

#Making the build directory if not present
mkdir -p ../build

#Converting from jsx to js
jsx app.jsx > app.js

#Packing to a single file that can be read from the browser
webpack ./app.js ../build/app.js

rm app.js

