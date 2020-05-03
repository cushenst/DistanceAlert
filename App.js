import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [homeLatitude, setLatitude] = useState(54.363500);
  const [homeLongitude, setLongitude] = useState(-7.327556);
  const [homeLocation, setHomeLocation] = useState("Not Set");
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

  });


  useEffect(() => {
    if (homeLongitude != -7.327556) {
      const interval = setInterval(() => {
        (async () => {
          let currentLocation = await Location.getLastKnownPositionAsync({ maximumAge: 15000 });
          console.log(`\n\nHome Location: ${homeLatitude}, ${homeLongitude} \nCurrent Location: ${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
          let newDistance = haversineDistance(homeLatitude, homeLongitude, currentLocation.coords.latitude, currentLocation.coords.longitude)
          setDistance(newDistance);
          console.log(`distance ${newDistance.toFixed(2)}`);
        })();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [homeLongitude]);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }


  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Distance from Home: {distance.toFixed(0)}m
      </Text>
      <Text style={[styles.text, { top: 25, fontSize: 15 }]}>
        Home Point set to: {homeLocation}
      </Text>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => setLocations(location, setLatitude, setLongitude, setHomeLocation)}
      >
        <Text style={styles.buttonText}>Set Home location</Text>
      </TouchableOpacity>
    </View>
  );
}


function setLocations(location, setLatitude, setLongitude, setHomeLocation) {
  if (location) {
    console.log(`accuracy: ${location.coords.accuracy}`);
    if (location.coords.accuracy < 30) {
      console.log('pressed');
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      (async () => {
        let currentStreetAddress = await Location.reverseGeocodeAsync(location.coords);
        setHomeLocation(currentStreetAddress[0].street);

      })();
    }
    else {
      Alert.alert(`gps accuracy too low \nit is currently ${location.coords.accuracy.toFixed(1)} meters`);
    }
  }
}


function haversineDistance(homeLatitude, homeLongitude, currentLatitude, currentLongitude) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lat1 = homeLatitude;
  var lon1 = homeLongitude;

  var lon2 = currentLongitude;
  var lat2 = currentLatitude;

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  return d * 1000;
}



const screenHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    backgroundColor: '#222',
    borderRadius: 5,
    padding: 10,
    margin: 20,
    marginBottom: 10,
    alignSelf: 'center',
    width: Dimensions.get('window').width * .7
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  text: {
    top: -screenHeight * .1,
    padding: 20,
    width: Dimensions.get('window').width * .9,
    textAlign: 'center',
    fontSize: 26,
    color: '#000',
  }
});