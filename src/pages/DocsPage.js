/* global google */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Table,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Pagination,
  Button,
  Dropdown,
  DropdownButton,
  Modal,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { FaMapMarkerAlt } from "react-icons/fa";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PizZipUtils from "pizzip/utils";
import "./DocsPage.css";
import { useGoogleMaps } from "../context/GoogleMaps";

const DocsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [itemsPerPageSetManually, setItemsPerPageSetManually] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const ApiDatos = `https://apitest.grupocarosa.com/ApiDatos`;
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 0, lng: 0 });

  const { isLoaded, mapId } = useGoogleMaps();

  const user = useSelector((state) => state.auth.userInfo);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const formatDateUser = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const monthNames = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const month = monthNames[d.getMonth()];
    const day = d.getDate();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} de ${month} del ${year} a las ${hours}:${minutes}`;
  };

  const fetchDocuments = async (fi, ff) => {
    console.log(`Soy los parametros fi ${fi} y ff ${ff}`);
    try {
      const response = await fetch(`${ApiDatos}/registroVisitas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fi,
          ff,
          empresa:"SVK"
        }),
      });
      const data = await response.json();
      console.log(`Data: ${data}`);
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fi = formatDate(startDate) || formatDate(new Date());
    const ff = formatDate(endDate) || formatDate(new Date());
    fetchDocuments(fi, ff);
  }, [startDate, endDate]);

  const fetchDocumentsDetails = async (doc) => {
    try {
      const response = await fetch(`${ApiDatos}/trasladosDetpag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user?.username || "",
          doc,
        }),
      });
      const data = await response.json();
      console.log(`Data: ${data}`);
      setDocuments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortDocuments = (documents, config) => {
    if (!config.key) return documents;

    return [...documents].sort((a, b) => {
      const aValue = a[config.key]
        ? a[config.key].toString().toLowerCase()
        : "";
      const bValue = b[config.key]
        ? b[config.key].toString().toLowerCase()
        : "";
      if (aValue < bValue) {
        return config.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const tableHead = [
    { key: "FECHA_HORA", label: "Fecha hora" },
    { key: "TIPO_VISITA", label: "Tipo visita" },
    { key: "EMPRESA", label: "Empresa" },
    { key: "CLIENTE", label: "Cliente" },
    { key: "NOMBRE_CLIENTE", label: "Nombre cliente" },
    { key: "VENDEDOR", label: "Vendedor" },
    { key: "VENTA_ESTIMADA", label: "Venta estimada" },
    { key: "COBRO", label: "Cobro" },
    { key: "NOTAS", label: "Notas" },
    { key: "ACCIONES", label: "Acciones" },
  ];

  const filterByDate = (doc) => {
    if (!startDate && !endDate) return true;
    const docDate = new Date(
      parseInt(doc.FECHA_HORA.replace("/Date(", "").replace(")/", ""))
    );
    if (startDate && docDate < startDate.setHours(0, 0, 0, 0)) return false;
    if (endDate && docDate > endDate.setHours(23, 59, 59, 999)) return false;
    return true;
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.TIPO_VISITA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.EMPRESA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.CLIENTE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.NOMBRE_CLIENTE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.VENDEDOR.toLowerCase().includes(searchQuery.toLowerCase()) &&
        filterByDate(doc))
  );

  const sortedDocuments = sortDocuments(filteredDocuments, sortConfig);
  const pageCount = Math.ceil(sortedDocuments.length / itemsPerPage);

  const currentDocuments = sortedDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (!itemsPerPageSetManually && filteredDocuments.length > 0) {
      setItemsPerPage(filteredDocuments.length);
    }
    setCurrentPage(1);
  }, [filteredDocuments.length, itemsPerPageSetManually]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (numItems) => {
    setItemsPerPage(numItems === "Todos" ? filteredDocuments.length : numItems);
    setItemsPerPageSetManually(true);
    setCurrentPage(1);
  };

  const getItemsPerPageOptions = (totalItems) => {
    const options = [10, 20, 50, 70];
    return options.filter((option) => option <= totalItems).concat(["Todos"]);
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

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentDocuments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Documentos");
    XLSX.writeFile(wb, "documentos.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredTableHead = tableHead.filter(
      (head) => head.label !== "Acciones"
    );
    doc.autoTable({
      head: [filteredTableHead.map((head) => head.label)],
      body: currentDocuments.map((doc) => [
        new Date(
          parseInt(doc.FECHA_HORA.replace("/Date(", "").replace(")/", ""))
        ).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        doc.TIPO_VISITA,
        doc.EMPRESA,
        doc.CLIENTE,
        doc.NOMBRE_CLIENTE,
        doc.VENDEDOR,
        doc.NOTAS,
      ]),
    });
    doc.save("documentos.pdf");
  };

  const loadFile = (url, callback) => {
    PizZipUtils.getBinaryContent(url, (error, content) => {
      if (error) {
        console.error("Error loading file:", error);
        callback(error);
      } else {
        callback(null, content);
      }
    });
  };

  const ImageComponent = ({ base64Image, className }) => {
    if (!base64Image) return null;

    return (
      <div>
        <img src={base64Image} alt="Base64 Image" className={className} />
      </div>
    );
  };

  const validateDates = (start, end) => {
    if (start && end && start > end) {
      setErrorMessage(
        "Fecha inválida: la fecha final debe ser mayor que la fecha inicial."
      );
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 1000);
      setStartDate(new Date());
      setEndDate(new Date());
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleStartDateChange = (date) => {
    if (validateDates(date, endDate)) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date) => {
    if (validateDates(startDate, date)) {
      setEndDate(date);
    }
  };

  const verMapa = async (lat, long) => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(long);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      console.error("Invalid coordinates:", lat, long);
      return;
    }

    setMapCoordinates({ lat: parsedLat, lng: parsedLng });
    setShowMapModal(true);

    if (isLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 0));

      const mapDiv = document.getElementById("map");
      if (mapDiv) {
        const map = new google.maps.Map(mapDiv, {
          center: { lat: parsedLat, lng: parsedLng },
          zoom: 15,
          mapId: mapId
        });

        const { AdvancedMarkerElement, PinElement } =
          await google.maps.importLibrary("marker");

        new AdvancedMarkerElement({
          map,
          position: { lat: parsedLat, lng: parsedLng },
          content: new PinElement({ background: "#0F3A7D" }).element,
        });
      } else {
        console.error("Map container not found");
      }
    }
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
        <Row className="justify-content-center w-100"></Row>
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
              <div className="export-button-container text-center mb-4">
                <DropdownButton
                  id="dropdown-basic-button"
                  title="Exportar archivo"
                >
                  <Dropdown.Item onClick={exportToExcel}>Excel</Dropdown.Item>
                  <Dropdown.Item onClick={exportToPDF}>PDF</Dropdown.Item>
                </DropdownButton>
              </div>
              <div className="date-filters">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
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
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Hasta"
                  className="date-picker"
                  dateFormat="dd-MM-yyyy"
                  isClearable
                />
              </div>
            </div>

            {error && <div className="text-danger mb-3">{error}</div>}
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
                        <th
                          key={index}
                          className={
                            head.key === "NOTAS" ? "notas" : head.key === ""
                          }
                          onClick={() => handleSort(head.key)}
                        >
                          {head.label}
                          {sortConfig.key === head.key
                            ? sortConfig.direction === "asc"
                              ? " ▲"
                              : " ▼"
                            : null}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {currentDocuments.map((doc, index) => (
                      <tr key={index}>
                        <td className="fixed-col">
                          <p>
                            {new Date(
                              parseInt(
                                doc.FECHA_HORA.replace("/Date(", "").replace(
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
                          </p>
                        </td>
                        <td className="fixed-col"><p>{doc.TIPO_VISITA}</p></td>
                        <td className="fixed-col">{doc.EMPRESA}</td>
                        <td className="fixed-col">{doc.CLIENTE}</td>
                        <td className="fixed-col">
                          <p>{doc.NOMBRE_CLIENTE}</p>
                        </td>
                        <td className="fixed-col">
                          <p>{doc.VENDEDOR}</p>
                        </td>
                        <td className="fixed-col">{doc.VENTA_ESTIMADA}</td>
                        <td className="fixed-col">{doc.COBRO}</td>
                        <td className="fixed-col">
                          <p>{doc.NOTAS}</p>
                        </td>
                        <td className="fixed-col">
                          <Button
                            variant="link"
                            onClick={() => verMapa(doc.LATITUD, doc.LONGITUD)}
                          >
                            <FaMapMarkerAlt icon={faEye} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-between">
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
                  <DropdownButton
                    id="dropdown-items-per-page"
                    title={`Mostrar ${itemsPerPage}`}
                    className="ml-2"
                  >
                    {getItemsPerPageOptions(filteredDocuments.length).map(
                      (option) => (
                        <Dropdown.Item
                          key={option}
                          active={
                            option === itemsPerPage ||
                            (option === "Todos" &&
                              itemsPerPage === filteredDocuments.length)
                          }
                          onClick={() =>
                            handleItemsPerPageChange(
                              option === "Todos"
                                ? filteredDocuments.length
                                : option
                            )
                          }
                        >
                          {option === "Todos" ? "Todos" : option}
                        </Dropdown.Item>
                      )
                    )}
                  </DropdownButton>
                </div>
              </div>
            )}
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Detalles del Documento: {selectedDoc} / Hoja: {selectedSheet}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Artículo</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {documentDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.ARTICULO}</td>
                    <td>{detail.DESCRIPCION}</td>
                    <td>{detail.CANTIDAD}</td>
                    <td>$ {detail.MONTO}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-end mt-3">
              <h5>
                Total: $
                {documentDetails
                  .reduce((acc, detail) => acc + detail.MONTO, 0)
                  .toFixed(2)}
              </h5>
            </div>
            <div>
              {documentDetails.length > 0 && (
                <div>
                  <div className="detail-container">
                    {documentDetails[0].IMAGEN && (
                      <ImageComponent
                        base64Image={documentDetails[0].IMAGEN}
                        className="imageStyles"
                      />
                    )}
                    <div className="detail-text">
                      {documentDetails[0].NOTAS && (
                        <p>{documentDetails[0].NOTAS}</p>
                      )}
                      {documentDetails[0].FECHA_HORA_ENTREGA && (
                        <p>
                          Fecha y hora:{" "}
                          {formatDateUser(
                            parseInt(
                              documentDetails[0].FECHA_HORA_ENTREGA.replace(
                                "/Date(",
                                ""
                              ).replace(")/", "")
                            )
                          )}
                        </p>
                      )}
                      {documentDetails[0].USUARIO && (
                        <p>
                          Entrega: {documentDetails[0].USUARIO}{" "}
                          {documentDetails[0].NOMBRE}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showErrorModal}
          onHide={() => setShowErrorModal(false)}
          centered
          className="error-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>
          <Modal.Body>{errorMessage}</Modal.Body>
        </Modal>
        <Modal
          show={showMapModal}
          onHide={() => setShowMapModal(false)}
          size="xl"
          centered
          className="modal-fullscreen"
        >
          <Modal.Header closeButton>
            <Modal.Title>Mapa de Ubicación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{ height: "100vh", width: "100%" }}>
              {isLoaded ? (
                <div id="map" style={{ height: "100vh", width: "100%" }}></div>
              ) : (
                <p>Cargando el mapa...</p>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMapModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Container>
  );
};

export default DocsPage;
