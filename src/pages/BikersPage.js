/* global google */
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { useGoogleMaps } from "../context/GoogleMaps";
import { FaUser } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import "./BikersPage.css";

const apiUrl = "https://apitest.grupocarosa.com/ApiDatos";

const getStatusColor = (status) => {
  switch (status) {
    case "Disponible":
      return "green";
    case "En viaje":
      return "blue";
    case "Receso":
      return "#FFA500";
    case "En recepción":
      return "black";
    case "No disponible":
      return "gray";
    default:
      return "white";
  }
};

const centralPoint = {
  lat: 13.691853,
  lng: -89.219394,
};

const createIconURL = () => {
  const icon = <FaUser size={18} color="blue" />;
  const svgString = renderToStaticMarkup(icon);
  const encoded = encodeURIComponent(svgString);
  return `data:image/svg+xml;charset=UTF-8,${encoded}`;
};

const MapComponent = ({ motociclistas, centerMapCoords }) => {
  const mapRef = useRef(null);
  const { isLoaded, mapId } = useGoogleMaps();
  const markersRef = useRef([]);

  const centerMap = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(18);
    }
  };

  useEffect(() => {
    if (isLoaded && motociclistas.length > 0) {
      const mapDiv = document.getElementById("map");
      if (mapDiv) {
        const map = new window.google.maps.Map(mapDiv, {
          center: centerMapCoords || centralPoint,
          zoom: 13,
          mapId: mapId,
        });

        mapRef.current = map;

        const markers = motociclistas.map((moto) => {
          const position = {
            lat: parseFloat(moto.LATITUD),
            lng: parseFloat(moto.LONGITUD),
          };

          const marker = new window.google.maps.Marker({
            position,
            map: null,
            title: `${moto.COBRADOR} - ${moto.NOMBRE}`,
            icon: {
              url: createIconURL(),
              scaledSize: new window.google.maps.Size(30, 30),
            },
          });

          marker.addListener("click", () => {
            centerMap(position.lat, position.lng);
          });

          return marker;
        });

        new MarkerClusterer({
          map,
          markers,
        });

        markersRef.current = markers;
      }
    }
  }, [isLoaded, motociclistas, centerMapCoords, mapId]);

  return (
    <div style={{ height: "85vh", width: "100%" }}>
      {!isLoaded ? (
        <Spinner animation="border" />
      ) : (
        <div id="map" style={{ height: "100%", width: "100%" }} />
      )}
    </div>
  );
};

const fetchTGetMotociclistas = async () => {
  const response = await fetch(`${apiUrl}/usuariosGPS`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
        body: JSON.stringify({
          empresa:"SVK"
        }),
  });


  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
  }

  const responseData = await response.json();
  return responseData;
};

const BikersPage = () => {
  const [motociclistas, setMotociclistas] = useState([]);
  const [centerMapCoords, setCenterMapCoords] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const { isLoaded } = useGoogleMaps(); // Hook para Google Maps

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedMotociclistas = [...motociclistas].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const fetchMoto = async () => {
    try {
      const data = await fetchTGetMotociclistas();
      const motociclistasConCoords = data.filter(
        (moto) => moto.LATITUD !== null && moto.LONGITUD !== null
      );
      setMotociclistas(motociclistasConCoords);
    } catch (error) {
      console.error("Error obteniendo motociclistas:", error);
    }
  };

  useEffect(() => {
    fetchMoto();
    const intervalId = setInterval(fetchMoto, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container fluid>
      <Row>
        <Col
          xs={8}
          className="position-relative"
          style={{ height: "85vh !important" }}
        >
          <MapComponent
            motociclistas={motociclistas}
            centerMapCoords={centerMapCoords}
          />
        </Col>
        <Col xs={4} style={{ height: "85vh" }}>
          <Card className="mt-0 card-body">
            <Card.Body>
              <div className="table-container">
                <Row>
                  <Col
                    xs={3}
                    className="padding-right"
                    onClick={() => handleSort("COBRADOR")}
                  >
                    <strong>
                      Código{" "}
                      {sortConfig.key === "COBRADOR"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </strong>
                  </Col>
                  <Col
                    xs={3}
                    className="no-padding"
                    onClick={() => handleSort("NOMBRE")}
                  >
                    <strong>
                      Nombre{" "}
                      {sortConfig.key === "NOMBRE"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </strong>
                  </Col>
                  <Col onClick={() => handleSort("ULTIMA_ACT")}>
                    <strong>
                      Última actualización{" "}
                      {sortConfig.key === "ULTIMA_ACT"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </strong>
                  </Col>
                </Row>
                <div className="scrollable-content">
                  {sortedMotociclistas.map((moto) => (
                    <Row
                      key={moto.COBRADOR}
                      className="align-items-center mt-2 table-row"
                      onClick={() =>
                        setCenterMapCoords({
                          lat: parseFloat(moto.LATITUD),
                          lng: parseFloat(moto.LONGITUD),
                        })
                      }
                    >
                      <Col xs={1} className="no-padding">
                        <div
                          style={{
                            backgroundColor: getStatusColor(
                              moto.ESTADO_NOMBRE ?? "No disponible"
                            ),
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                          }}
                        ></div>
                      </Col>
                      <Col
                        xs={1}
                        className="text-wrap custom-font-size no-padding-h"
                      >
                        {moto.COBRADOR}
                      </Col>
                      <Col xs={5} className="text-wrap custom-font-size">
                        {moto.NOMBRE}
                      </Col>
                      <Col xs={5} className="text-wrap custom-font-size">
                        {new Date(
                          parseInt(
                            moto.ULTIMA_ACT.replace("/Date(", "").replace(
                              ")/",
                              ""
                            )
                          )
                        ).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Col>
                    </Row>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BikersPage;
