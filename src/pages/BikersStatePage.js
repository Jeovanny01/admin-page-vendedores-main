import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Pagination,
  Button,
  Modal,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import {
  FaSearch,
  FaEye,
  FaClipboardList,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import "./BikersStatePage.css";

const BikersStatePage = () => {
  const [bikers, setBikers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBitacoraModal, setShowBitacoraModal] = useState(false);
  const [selectedBiker, setSelectedBiker] = useState(null);
  const [bikerDetails, setBikerDetails] = useState([]);
  const [bitacoraDetails, setBitacoraDetails] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const itemsPerPage = 20;
  const [intervaloTiempo, setIntervaloTiempo] = useState("");
  const [distancia, setDistancia] = useState("");
  const ApiDatos = `https://apitest.grupocarosa.com/ApiDatos`;
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const userInfo = useSelector((state) => state.auth.userInfo);

  const user = useSelector((state) => state.auth.userInfo);
  const navigate = useNavigate();

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

  const fetchBikers = async () => {
    try {
      const response = await fetch(`${ApiDatos}/usuariosGPS`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      body: JSON.stringify({
        empresa:"SVK"
      }),
    });
  

      const data = await response.json();
      setBikers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bikers:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikers();
  }, []);

  const handleViewDetails = async (biker) => {
    setSelectedBiker(biker);
    setShowBitacoraModal(false);
    setShowModal(true);
    try {
      const response = await fetch(`${ApiDatos}/documentosRuta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: biker.VENDEDOR,
        }),
      });
      const data = await response.json();
      setBikerDetails(data);
    } catch (error) {
      console.error("Error fetching biker details:", error);
    }
  };

  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    return `${year}${month}${day}`;
  };

  const handleViewBitacoraState = async (biker) => {
    setSelectedBiker(biker);
    setShowModal(false);
    setShowBitacoraModal(true);
    try {
      const fi = startDate
        ? formatDateToYYYYMMDD(startDate)
        : formatDateToYYYYMMDD(new Date());
      const ff = endDate
        ? formatDateToYYYYMMDD(endDate)
        : formatDateToYYYYMMDD(new Date());

      console.log(
        `soy el fi ${fi} y yo el ff ${ff} y yo soy el biker ${biker.VENDEDOR}`
      );
      const response = await fetch(`${ApiDatos}/bitacoraMarc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: biker.VENDEDOR,
          fi,
          ff,
          empresa:"SVK"
        }),
      });
      const data = await response.json();
      console.log(`Data:`, data);

      setBitacoraDetails(data);
    } catch (error) {
      console.error("Error fetching bitacora details:", error);
    }
  };

  useEffect(() => {
    if (selectedBiker && showBitacoraModal) {
      handleViewBitacoraState(selectedBiker);
    }
  }, [startDate, endDate]);

  const handleFilterClick = () => {
    if (selectedBiker) {
      handleViewBitacoraState(selectedBiker);
    }
  };

  const handleOpenIntervalModal = () => {
    setShowIntervalModal(true);
  };

  const handleCloseIntervalModal = () => {
    setShowIntervalModal(false);
  };

  const sendTrackingParametrs = async (
    timeInterval,
    distanceInterval,
    accion
  ) => {
    try {
      const response = await fetch(`${ApiDatos}/gpsPar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user?.username || "",
          timeInterval,
          distanceInterval,
          accion,
        }),
      });

      const text = await response.text();
      if (text) {
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          const data = JSON.parse(text);

          if (Array.isArray(data) && data.length === 0) {
            return null;
          }

          return data;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error sending gpsPar data:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accion = "SELECT";
    const tiempoEnMilisegundos = parseInt(intervaloTiempo) * 1000;
    const distanciaFormateada = parseFloat(distancia).toFixed(1);

    try {
      const response = await sendTrackingParametrs(
        tiempoEnMilisegundos,
        distanciaFormateada,
        accion
      );
      if (response === null) {
        const response = await sendTrackingParametrs(
          tiempoEnMilisegundos,
          distanciaFormateada,
          "INSERT"
        );

        console.log(`Response1 ${response}`);
      } else {
        const response = await sendTrackingParametrs(
          tiempoEnMilisegundos,
          distanciaFormateada,
          "UPDATE"
        );

        console.log(`Response2 ${response}`);
      }
      setShowIntervalModal(false);
    } catch (error) {
      console.error("Error sending gpsPar data:", error);
    }
  };

  const handleShowOnMap = (biker) => {
    navigate("/SellersPage", {
      state: {
        centerMapCoords: {
          lat: parseFloat(biker.LATITUD),
          lng: parseFloat(biker.LONGITUD),
        },
      },
    });
  };

  const tableHead = [
    "Código",
    "Nombre",
    "Estado",
    "Última Actividad",
    "Dispositivo",
    "Porcentaje",
    "Conexión",
    "Acciones",
  ];

  const filteredBikers = bikers.filter(
    (biker) =>
      biker.VENDEDOR.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biker.NOMBRE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      biker.ESTADO_NOMBRE.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageCount = Math.ceil(filteredBikers.length / itemsPerPage);

  const currentBikers = filteredBikers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationItems = () => {
    let items = [];
    const maxVisiblePages = 4;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(pageCount, currentPage + halfVisible);

    if (currentPage <= halfVisible) {
      endPage = Math.min(pageCount, maxVisiblePages);
    }

    if (currentPage + halfVisible >= pageCount) {
      startPage = Math.max(1, pageCount - maxVisiblePages + 1);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return items;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const timestamp = parseInt(
      dateString.replace("/Date(", "").replace(")/", "")
    );
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center min-vh-100"
    >
      <Container
        fluid
        className="d-flex flex-column align-items-center min-vh-100 p-4"
      >
        <Row className="justify-content-center w-100">
          <Col xs={12}>
            <div className="topBar d-flex justify-content-between align-items-center mb-4">
              <InputGroup className="searchBarContainer w-25">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              {userInfo && userInfo.role === 1 && (
                <Button variant="primary" onClick={handleOpenIntervalModal}>
                  Configurar Intervalos
                </Button>
              )}
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="table-responsive">
                <Table
                  striped
                  bordered
                  hover
                  className="text-center fixed-table"
                >
                  <thead>
                    <tr>
                      {tableHead.map((head, index) => (
                        <th key={index}>{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentBikers.map((biker, index) => (
                      <tr key={index}>
                        <td>{biker.VENDEDOR}</td>
                        <td>{biker.NOMBRE}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div
                              style={{
                                backgroundColor: getStatusColor(
                                  biker.ESTADO_NOMBRE ?? "No disponible"
                                ),
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                marginRight: "5px",
                              }}
                            ></div>
                            {biker.ESTADO_NOMBRE || "No disponible"}
                          </div>
                        </td>

                        <td>{formatDate(biker.ULTIMA_ACT)}</td>
                        <td>{biker.DISPOSITIVO}</td>
                        <td>{biker.BATERIA}%</td>
                        <td>{biker.RED}</td>
                        <td>
                          <Button
                            variant="link"
                            onClick={() => handleViewDetails(biker)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => handleShowOnMap(biker)}
                          >
                            <FaMapMarkerAlt />
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => handleViewBitacoraState(biker)}
                          >
                            <FaClipboardList />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Pagination>
                  {currentPage > 1 && (
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  )}
                  {renderPaginationItems()}
                  {currentPage < pageCount && (
                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  )}
                </Pagination>
              </div>
            )}
          </Col>
        </Row>
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              Documentos de Ruta {selectedBiker?.NOMBRE}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {bikerDetails.length > 0 ? (
              <>
                <Table striped bordered hover className="text-center">
                  <thead>
                    <tr>
                      <th>Documento</th>
                      <th>Fecha</th>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Monto</th>
                      <th>Hoja</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bikerDetails.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.DOCUMENTO_INV}</td>
                        <td>{formatDate(detail.FECHA_HOR_CREACION)}</td>
                        <td>{detail.ORIGEN}</td>
                        <td>{detail.DESTINO}</td>
                        <td>{detail.MONTO}</td>
                        <td>{detail.HOJA}</td>
                        <td>{detail.TIPO}</td>
                        <td>{detail.NOMBRE_ESTADO}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <p>Este motociclista no tiene documentos aceptados.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showBitacoraModal}
          onHide={() => setShowBitacoraModal(false)}
          size="xl"
        >
          <Modal.Header closeButton>
            <Modal.Title>Bitácora de {selectedBiker?.NOMBRE}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="date-filters d-flex justify-content-center mb-4">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Desde"
                className="date-picker"
                dateFormat="dd-MM-yyyy"
                isClearable
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="Hasta"
                className="date-picker"
                dateFormat="dd-MM-yyyy"
                isClearable
              />

              <Button variant="primary" onClick={handleFilterClick}>
                Filtrar
              </Button>
            </div>
            {bitacoraDetails.length > 0 ? (
              <>
                <Table striped bordered hover className="text-center">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Estado estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bitacoraDetails.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.VENDEDOR}</td>
                        <td>{detail.NOMBRE}</td>
                        <td>{detail.NOMBRE_ESTADO}</td>
                        <td>{formatDate(detail.FECHA_HORA)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            ) : (
              <p>Este motociclista no tiene bitácora registrada.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowBitacoraModal(false)}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={showIntervalModal}
          onHide={handleCloseIntervalModal}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Intervalos de Tiempo y Distancia</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formIntervaloTiempo">
                <Form.Label>Intervalo de Tiempo (segundos)</Form.Label>
                <Form.Control
                  type="number"
                  value={intervaloTiempo}
                  onChange={(e) => setIntervaloTiempo(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formDistancia">
                <Form.Label>Distancia (metros)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.1"
                  value={distancia}
                  onChange={(e) => setDistancia(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Enviar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </Container>
  );
};

export default BikersStatePage;
