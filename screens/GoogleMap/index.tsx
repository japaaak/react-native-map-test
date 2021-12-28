import React, { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

import { Container } from "./styles";

interface IGeolocation {
  latitude: number;
  longitude: number;
  heading: number;
}

interface MapKmlData {
  data: {
    kml: string;
  };
}

export function GoogleMap() {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [location, setLocation] = useState<IGeolocation>({
    latitude: 35.6812362,
    longitude: 139.7649361,
    heading: 0,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [centralizeCameraOnUser, setCentralizeCameraOnUser] = useState(false);
  const [mapKml, setMapKml] = useState<MapKmlData>({} as MapKmlData);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        return setErrorMsg("位置情報へのアクセス権が拒否されました");
      }

      if (status === "granted") {
        const data = {
          id: "trial",
          fid: 4,
        };

        const response = api.post("/map", data);

        const local = await Location.getCurrentPositionAsync({});

        var heading = 0;

        if (local.coords.heading === null) {
          heading = 0;
        } else {
          heading = local.coords.heading;
        }

        const parseLocation = {
          latitude: local.coords.latitude,
          longitude: local.coords.longitude,
          heading,
        };

        const kmlFile = response.data.data.kml + "?rf=" + Date.now().toString();

        const parseMapKml = {
          data: {
            kml: kmlFile,
          },
        };

        setMapKml(parseMapKml);
        setLocation(parseLocation);
      }

      setIsLoading(false);
    })();
  }, []);

  return (
    <Container>
      <MapView
        style={{
          flex: 1,
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        }}
        ref={mapRef}
        showsUserLocation
        mapType={mapType}
        showsMyLocationButton={false}
        scrollEnabled={centralizeCameraOnUser === false}
        kmlSrc={mapKml.data.kml}
      ></MapView>
    </Container>
  );
}
