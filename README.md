# youremote
Play songs in your speaker from anywhere in your home !

## Prerequisites
The app uses the wonderful [mpsyt](https://github.com/mps-youtube/mps-youtube) library to play youtube songs. So you need to install that first.
```
[sudo] pip3 install mps-youtube
```

## Steps to Run the app
1> First, we need to install the node libraries
```
$cd public/scripts
$npm install
```
2> For every time you touch the jsx file, you need to rebuild jsx to js again. Therefore, run the build.sh script
```
$./build.sh
```
3>
```
go run server.go
```
