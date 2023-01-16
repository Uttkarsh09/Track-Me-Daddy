const express = require("express");
const{ initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc } = require('firebase/firestore');
const { doc, getDoc } = require("firebase/firestore");
const bodyParser = require("body-parser");
const db = require("./firebaseData");

const cors = require("cors");
const app = express();
const port = 9999;
const GOOGLE_CLOUD_DIRECTIONS_API_KEY = "your_api_key";

let busStatusTimestamp = new Date()/1000;
let busStatusLastStop = "Swargate";

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res, next) => {
    console.log("new request recieved");
    next();
});

app.post("/updateCoordinates/", (req, res, next) => {
    try{
        console.log("IN HERER");
        console.log(`Dev Id - ${req.body.Devid}`);
        console.log(`$Lat - ${req.body.lat}`);
        console.log(`$Lng - ${req.body.lng}`);
        const currLocation = {
            _lat: req.body.lat,
            _long: req.body.lng,
        };

        updateNewBusInfo(req.body.Devid, currLocation, res);

        // res.json({
        //     msg: "Success Data Recieved",
        // });
    } catch (err){
        console.log(err);
        res.send(err);
    }
});

// To trigger automatic updated of current location for sumulation of a moving bus
app.get("/updateStaticRoutes/", (req, res, next) => {
    console.log("updateStaticRoutes");
    
    let coords = ["18.528062,73.851800","18.527901, 73.851708" ,"18.527901, 73.851708","18.527901, 73.851708"
    ,"18.527902,73.851658", "18.527750,73.851587",
    "18.527628,73.851477", "18.527502,73.851366", "18.527380,73.851215",
    "18.527169,73.851025", "18.527268,73.851116", "18.527051,73.850941",
    "18.526811,73.850791", "18.526628,73.850670", "18.526423,73.850496",
    "18.526131,73.850321", "18.525920,73.850183", "18.525703,73.850044",
    "18.525469,73.849918", "18.525092,73.849623", "18.524594, 73.849351","18.524594, 73.849351",
    "18.524594, 73.849351","18.524710,73.849394",
    "18.524556,73.849249", "18.524350,73.849111", "18.524150,73.848996",
    "18.523928,73.848888", "18.523682,73.848726", "18.523668, 73.848716","18.523668, 73.848716","18.523668, 73.848716"
    ,"18.523528,73.848629", "18.523065,73.848322", "18.522963,73.848238", "18.522717,73.848021",
    "18.522449,73.847852", "18.522215,73.847642", "18.521975,73.847431",
    "18.519089, 73.845027","18.519089, 73.845027","18.519089, 73.845027","18.517846,73.843963","18.517846,73.843963", "18.517846,73.843963","18.517811,73.843930", "18.517799,73.843916",
    "18.517784,73.843905", "18.517768,73.843891", "18.517752,73.843875",
    "18.517736,73.843863", "18.517720,73.843851", "18.517705,73.843834",
    "18.517684,73.843812", "18.517654,73.843795", "18.517647,73.843780",
    "18.517625,73.843767", "18.517615,73.843760", "18.517606,73.843749",
    "18.517589,73.843737", "18.517572,73.843720", "18.517558,73.843706",
    "18.517573,73.843711", "18.517541,73.843690", "18.517548,73.843697",
    "18.517526,73.843674", "18.517514,73.843661", "18.517493,73.843648",
    "18.517480,73.843633", "18.517466,73.843618", "18.517473,73.843626",
    "18.517456,73.843607", "18.517407,73.843583", "18.517377,73.843539",
    "18.517346,73.843517", "18.517312,73.843482", "18.517167,73.843331",
    "18.517108,73.843284", "18.517039,73.843238", "18.516971,73.843165",
    "18.516897,73.843124", "18.516828,73.843077", "18.516755,73.843010",
    "18.516696,73.842933", "18.516652, 73.842973","18.516652, 73.842973","18.516652, 73.842973","18.516608,73.842891", "18.516461,73.842793",
    "18.516372,73.842746"];
    let i = 0;
    
    getDoc(doc(db, "buses", `bus001`))
    .then((busesSnap) => {
        if(busesSnap.exists()) {
            let buses = busesSnap.data();
            console.log("- - - - - -  -BUSSES- - - - - - -");
            console.log(buses);
            const routes = buses.routes;

            setInterval(async ()=>{
                console.log(`Uploading ${i}`);
                const newObject = {
                    ...buses,
                    currentCoordinate: coords[i],
                };
                
                await setDoc(doc(db, "buses", `bus001`), newObject);
                console.log("Coordinates updated successfully");
                i++;
                console.log("Increased i "+i);
                const coordArr = coords[i].split(',');
                const currLocation = {
                    _lat: coordArr[0],
                    _long: coordArr[1],
                }
                
                routes.map(async (route) => {
                    const stopCoordinates = {
                        _lat: route.coordinate.split(",")[0],
                        _long: route.coordinate.split(",")[1],
                    }
                    const API_ENDPOINT = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${currLocation._lat},%20${currLocation._long}&destinations=${stopCoordinates._lat},%20${stopCoordinates._long}&key=${API_KEY}`;
                    const response = await fetch(API_ENDPOINT)
                    const json = await response.json();
                    // console.log(json);
                    route.timeToReach = json.rows[0].elements[0].duration.text;
                    
                    // TODO - Do not update time to arrive a stop if it is already reached or has been crossed.
                    if(parseInt(json.rows[0].elements[0].duration.text.split(" ")[0]) <= 3){
                        route.status = "reached";
                    }
                });

                await setDoc(doc(db, "buses", `bus001`),{
                    ...buses,
                    routes: routes,
                });
            }, 5000);
        }
        else {
            res.json({errMsg: "No such document"});
            console.log("No such document");
            return ;
        }
    });
})

function updateNewBusInfo(devId, currLocation, res){
    try{
        let buses;

        getDoc(doc(db, "buses", `bus001`))
        .then((busesSnap) => {
            if(busesSnap.exists()) {
                buses = busesSnap.data();
            }
            else {
                res.json({errMsg: "No such document"});
                console.log("No such document");
                return ;
            }

            const newObject = {
                ...buses,
                currentCoordinate: `${currLocation._lat},${currLocation._long}`,
            };

            // setDoc(doc(db, "buses", `${devId}`), newObject)
            // .then((data) => {
            //     console.log("Coordinates updated successfully");
            //     res.json({msg: "Success"});
            // }).catch((err) => {
            //     console.log("error while updating coordinates");
            //     res.json({msg: "FAILURE"});
            // });
            
            // console.log(buses);
            console.log("~~~~~~~~~~~~~~STARTING~~~~~~~~~~~~~~");
            const routes = buses.routes;
            // console.log(routes);
            let lowestDistance=99999999, nearestStopName=routes[0].stopName, busIndex=-1;
            
            routes.forEach((busStop, idx) => {
                let busCoordinate = busStop.coordinate;    
                let busCoordinateArr = busCoordinate.split(",");
                busCoordinate = {
                    _lat: busCoordinateArr[0],
                    _long: busCoordinateArr[1],
                };

                const distance = getDistance(currLocation, busCoordinate)*1000;
                if(distance <= lowestDistance) {
                    busIndex = idx;
                    lowestDistance = distance;
                    nearestStopName = busStop.stopName;
                }
            });
            console.log(`Nearest stop - ${nearestStopName}`);
            console.log(`Lowest distance - ${lowestDistance}`);

            const currTimeInSec = new Date()/1000;
            const timeDifference = currTimeInSec - busStatusTimestamp;
            
            // If time difference is more than 10s and the current nearest stop and
            // previous nearest stop are the same then change status of the stop 
            if(timeDifference >= 10){
                if(nearestStopName === busStatusLastStop){
                    let updateStopStatusArray = routes;

                    updateStopStatusArray.map((stop)=>{
                        if(stop.name === nearestStopName){
                            stop.staus = reached;
                        }
                    });

                    // TODO VERIFY WHETHER THE STOP STATUS IS UPDATED OR NOT
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                    console.log(`Update stop - ${nearestStopName}`);
                    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                    console.log(updatedStatusOfStops);

                    busStatusTimestamp = currTimeInSec;

                    // setDoc(doc(db, "buses", `bus${devId}`), {
                    //     ...buses,
                    //     routes: updateStopStatusArray,
                    // }).then(data=>{
                    //     console.log(data);
                    //     console.log("Coordinates updated successfully");
                    // }).catch((err)=>{
                    //     console.log("error while updating coordinates");
                    // });
                }
            } 
        })

    } catch (err){
        console.log("Err caught");
        console.log(err);
    }
}

// Code to reset a document in case of incorrect updates, that change the schema of a document
app.get("/reset/", (req, res, next) => {
    setDoc(doc(db, "buses", `bus001`), {
        currentCoordinate: { _long: '73.858091', _lat: '18.499411' },
        depotName: "Shivajinagar Depot",
        status: "not running",
        from: "Shivajinagar",
        to: "Deccan",
        scheduleStart: "10:00 AM",
        scheduleEnd: "11:00 AM",
        routes: [
            { 
                status: 'not_reached', 
                coordinate: '18.531279,73.844305', 
                name: 'shivajinagar'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.529509,73.834584', 
                name: 'deep_bungalow_chowk'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.529305,73.833018', 
                name: 'dr_homi_bhabha_hospital'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.528941,73.831078', 
                name: 'vetalbaba_chowk'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.527968,73.830066', 
                name: 'ratna_hospital'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.522003,73.829477', 
                name: 'symbiosys'
            },
            { 
                status: 'not_reached', 
                coordinate: '18.516329,73.836527', 
                name: 'deccan'
            },
        ]
      }).then(data=>{
        console.log(data);
        console.log("data reset successfully");
        res.send("done")
    }).catch((err)=>{
        console.log("error while resetting");
    });
});


function getBusInfo(devId, currLocation){
    const busId = `bus${devId}`;
    const busesRef = doc(db, "buses", busId);

    getDoc(busesRef).then((busesSnap)=>{
        let buses;

        if(busesSnap.exists()) buses = busesSnap.data();
        else {
            res.json({ errMsg: "No such document" })
            console.log("No such document");
        }
        console.log(buses);

        // Calculating nearest stop from the coordinate
        const routes = buses.route;
        console.log(routes);
        let lowestDistance=99999999, nearestStop=routes[0].stopName, busIndex=-1;
        
        routes.forEach((busStop, idx) => {
            let busCoordinate;

            if(busStop.coordinate != undefined) busCoordinate = busStop.coordinate;
            else if(busStop.coordinates != undefined) busCoordinate = busStop.coordinates;
            else busCoordinate = busStop.cooridinate;
            
            const distance = getDistance(currLocation, busCoordinate);
            if(distance <= lowestDistance) {
                busIndex = idx;
                lowestDistance = distance;
                nearestStop = busStop.stopName;
            }
        });
        
        console.log(`Lowest Distance - ${lowestDistance}`);
        console.log(`Stop Name - ${nearestStop}`);
        
        busesRef.update({
            currentCoordinate: currLocation,
        })
        
        let currTimeInSec = new Date()/1000;
        if((currTimeInSec - busStatusTimestamp) > 10){
            if(nearestStop === busStatusLastStop){
                // stop arrived checked
                if(nearestStop === "upper-bus-depot"){
                    let resetedRoutes = routes;
                    resetedRoutes.map((stop)=>{
                        stop.status = "yet_to_reach"
                    })

                    busesRef.update({
                        route: resetedRoutes,
                    });
                } 
                else {
                    let updatedStatusOfStops = routes;
                    updatedStatusOfStops.map((stop) => {
                        if(stop === busStatusLastStop){
                            stop.status = "reached";
                        }
                        busStatusLastStop = nearestStop;
                    });
                }
                busStatusTimestamp = currTimeInSec;
            }
        }
    });
}

function getDistance(currLocation, stopCoord){
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(currLocation._lat - stopCoord._lat);  // deg2rad below
    var dLon = deg2rad(currLocation._long - stopCoord._long); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(currLocation._lat)) * Math.cos(deg2rad(stopCoord._lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

// app.get("/hardware", (req, res) => {
//     console.log(`New Request - ${req.url}`);
//     res.json({
//         status: "Working",
//     })
// });

app.get("/", (req, res) => {
    console.log("Request recieved with no endpoint");
    console.log(req.url);
    res.json({
        errMsg: "endpoint not found",
    })
})

app.listen(port, ()=>{
    console.log("Server started");
    console.log(`Listening on port - ${port}\n\n`);
});

