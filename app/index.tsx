import { Button, View, Image, Text, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function Index() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização negada!');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  const pickImage = async () => {
    // Solicitar permissão
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Você precisa permitir o acesso à galeria!");
      return;
    }

    // Selecionar imagem
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await compressImage(result.assets[0].uri)
      setImage(compressedImage);
    }
  };

   // Function to capture an image using the camera
   const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa permitir o acesso à câmera!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await compressImage(result.assets[0].uri)
      setImage(compressedImage);
    }
  };

  const compressImage = async (uri: string) => {
    const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [{resize: { width: 400} }], { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG});
    console.log(manipulatedImage);

    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();
    const sizeInKB = blob.size / 1024;
    Alert.alert(`Tamanho da imagem comprimida: ${sizeInKB.toFixed(2)} KB`);
    return manipulatedImage.uri;
  }

  if (!location) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {location && image && (
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
            <Image source={{ uri: image }} style={{ width: 84, height: 84, borderRadius: 42 }} />
          </Marker>
        )}
      </MapView>
      <View style={{ position: 'absolute', bottom: 50, left: 20, right: 20 }}>
        <Button title="Selecionar Imagem" onPress={pickImage} />
        <Button title="Tirar uma Foto" onPress={takePhoto} />
      </View>
    </View>
  );
}