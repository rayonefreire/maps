import React, { useState, useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TextInput, Button, ActivityIndicator, Text } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState([]);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // função para pegar a localização atual do usuário
  async function getLocation() {
    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permissão de localizção negada");
      return;
    }

    await Location.getCurrentPositionAsync({})
      .then((data) => {
        console.log(data);

        setLocation({
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // função para pesquisar lugares
  async function searchPlaces() {
    setLoading(true);

    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${search}&format=json`);
    await response.json()
      .then((data) => {
        console.log(data);
        setPlaces(data);

        if (data.length > 0) {
          const latitudes = data.map(p => p.lat);
          const longitudes = data.map(p => p.lon);
          const minLatitude = Math.min(...latitudes);
          const maxLatitude = Math.max(...latitudes);
          const minLongitude = Math.min(...longitudes);
          const maxLongitude = Math.max(...longitudes);
    
          setLocation({
            latitude: (minLatitude + maxLatitude) / 2,
            longitude: (minLongitude + maxLongitude) / 2,
            latitudeDelta: maxLatitude - minLatitude,
            longitudeDelta: maxLongitude - minLongitude,
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      }) 
  }

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={setSearch}
        placeholder="Pesquisar Lugares"
        placeholderTextColor="gray"
        style={styles.input}
      />

      <Button title="Buscar" onPress={searchPlaces} />

      {
        !loading ?
        <MapView
          style={styles.map}
          region={location}
          showsUserLocation={true}
        >
          {places.map(p => (
            <Marker
              key={p.place_id}
              coordinate={{ latitude: p.lat, longitude: p.lon }}
              title={p.display_name}
            />
          ))}
        </MapView> :

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color='#00BFFF' />
          <Text style={{ fontSize: 18, color: 'gray', marginTop: 10, }}>Localizando</Text>
        </View>
      }
      
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 70,
    marginBottom: 20,
    marginHorizontal: 24,
    borderRadius: 7,
    paddingLeft: 10,
    fontSize: 18,
    color: 'white'
  },
  map: {
    height: '100%',
  }
});
