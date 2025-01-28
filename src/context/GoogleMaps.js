import { useLoadScript } from "@react-google-maps/api";
import React, { createContext, useContext } from "react";

const GoogleMapsContext = createContext(null);
const googleMapsLibraries = ["places", "geometry", 'marker'];
const mapId = '602471ccd4ec26ae';

export const GoogleMapProvider = ({ children }) => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyDWaMvjQhth5It2thtLVHMZ8XpoOAdBKSk",
        libraries: googleMapsLibraries,
        mapIds: [mapId],
        options: {
            loading: "lazy",
        },
    });

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError, mapId }}>
            {children}
        </GoogleMapsContext.Provider>
    );
};

export const useGoogleMaps = () => {
    return useContext(GoogleMapsContext);
};