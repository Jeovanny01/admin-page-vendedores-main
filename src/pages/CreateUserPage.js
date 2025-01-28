import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "./CreateUser.css";

const CreateUserPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserCreatorVisible, setIsUserCreatorVisible] = useState(false);
  const [name, setName] = useState("");
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [user, setUser] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState("");
  const [userKind, setUserKind] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [markCode, setMarkCode] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [originalUser, setOriginalUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const API_URL = "https://apitest.grupocarosa.com/ApiDatos";

  useEffect(() => {
    const isValidEmail = mail === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

    let isFormValid;
    if (isEditMode) {
      isFormValid =
        name !== "" &&
        user !== "" &&
        estado !== "" &&
        userKind !== "" &&
        isValidEmail &&
        password !== "" &&
        markCode !== "" &&
        (name !== originalUser.name ||
          user !== originalUser.username ||
          mail !== originalUser.email ||
          estado !==
            (originalUser.status === "active" ? "active" : "inactive") ||
          userKind !== originalUser.userType ||
          markCode !== originalUser.markCode ||
          password !== originalUser.password);
    } else {
      isFormValid =
        name !== "" &&
        user !== "" &&
        password !== "" &&
        estado !== "" &&
        userKind !== "" &&
        markCode !== "" &&
        isValidEmail;
    }

    setIsChanged(isFormValid);
  }, [name, user, mail, password, estado, userKind, originalUser, isEditMode, markCode]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleUserChange = (e) => {
    setUser(e.target.value);
  };

  const handleMailChange = (e) => {
    setMail(e.target.value);
    setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setEstado(e.target.value);
  };

  const handleMarcaChange = (e) => {
    setMarkCode(e.target.value);
  }

  const handleUserKindChange = (e) => {
    setUserKind(e.target.value);
  };

  const handleSaveChanges = async () => {
    const isValidEmail = mail === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

    if (!isValidEmail) {
      setMessage("Correo no válido");
      setErrorMessageVisible(true);
      setMessageModalVisible(true);
      setTimeout(() => {
        setMessageModalVisible(false);
      }, 3000);
      return;
    }

    if (isUsernameTaken(user.toString()) && !isEditMode) {
      setMessage("El nombre de usuario ya existe");
      setErrorMessageVisible(true);
      setMessageModalVisible(true);
      setTimeout(() => {
        setMessageModalVisible(false);
      }, 3000);
      return;
    }

    const newState = estado === "active";
    const userRoll =
      userKind === "administrador"
        ? 1
        : userKind === "farmacia"
        ? 2
        : userKind === "farmacia-admon"
        ? 4
        : 3;

    const newUser = {
      name: name,
      user: user,
      pass: password,
      mail: mail,
      estado: newState,
      rol: userRoll,
    };

    try {
      const response = await fetch(
        isEditMode ? `${API_URL}/UpdateUser2` : `${API_URL}/InsertUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (data === 1) {
        setMessage(`Usuario ${isEditMode ? "editado" : "creado"} exitosamente`);
        setSuccessMessageVisible(true);
        setMessageModalVisible(true);
        setTimeout(() => {
          setMessageModalVisible(false);
          handleButtonCancel();
          fetchUsers();
        }, 3000);
      } else {
        setMessage(`Error al ${isEditMode ? "editar" : "crear"} el usuario`);
        setErrorMessageVisible(true);
        setMessageModalVisible(true);
        setTimeout(() => {
          setMessageModalVisible(false);
        }, 3000);
      }
    } catch (error) {
      setMessage("Error de red");
      setErrorMessageVisible(true);
      setMessageModalVisible(true);
      setTimeout(() => {
        setMessageModalVisible(false);
      }, 3000);
    }
  };

  const handleButtonCancel = () => {
    setIsUserCreatorVisible(false);
    setIsEditMode(false);
    setName("");
    setUser("");
    setPassword("");
    setMail("");
    setEstado("");
    setUserKind("");
    setMarkCode("");
    setOriginalUser(null);
  };

  const isUsernameTaken = (username) => {
    if (typeof username !== "string") {
      return false;
    }
    return users.some(
      (user) =>
        typeof user.username === "string" &&
        user.username.toLowerCase() === username.toLowerCase()
    );
  };

  const validateEmail = () => {
    if (mail !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setEmailError("Correo no válido");
    } else {
      setEmailError("");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/listaUsuarios`);
      const data = await response.json();

      const formattedData = data.map((user) => ({
        name: user.NOMBRE,
        username: user.USUARIO,
        password: user.CONTRASEÑA,
        email: user.CORREO || "",
        status: user.ESTADO ? "active" : "inactive",
        markCode: user.COD_MARCACION,
        userType: user.NOMBRE_ROL.toLowerCase(),
      }));

      setUsers(formattedData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const tableHead = [
    "Nombre",
    "Usuario",
    "Codigo",
    "Correo",
    "Estado",
    "Tipo de usuario",
    "Editar",
    "Borrar",
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user) => {
    setName(user.name);
    setUser(user.username);
    setPassword(user.password);
    setMail(user.email);
    setEstado(user.status === "active" ? "active" : "inactive");
    setMarkCode(user.markCode);
    setUserKind(user.userType);
    setEditingUserId(user.id);
    setOriginalUser(user);
    setIsEditMode(true);
    setIsUserCreatorVisible(true);
  };

  const handleCreateUser = () => {
    setIsUserCreatorVisible(true);
    console.log("Crear usuario");
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/deleteUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userToDelete.username,
        }),
      });

      if (response.ok) {
        console.log("Usuario eliminado exitosamente", response.text());
        setMessage("Usuario eliminado exitosamente");
        setSuccessMessageVisible(true);
        setIsDeleteConfirmVisible(false);
        fetchUsers();
      } else {
        console.log("Error al eliminar el usuario");
        setMessage("Error al eliminar el usuario");
        setErrorMessageVisible(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error de red");
      setErrorMessageVisible(true);
    }
  };

  return (
    <>
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
                <Button
                  className="createButton d-flex align-items-center"
                  onClick={handleCreateUser}
                >
                  <FaPlus className="me-2" />
                  Crear Usuario
                </Button>
              </div>
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
                            index === 0
                              ? "name-col"
                              : index === 3
                              ? "email-col"
                              : index === 4
                              ? "user-kind-col"
                              : ""
                          }
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={index}>
                        <td className="name-col tab-row"><p>{user.name}</p></td>
                        <td className="tab-row"><p>{user.username}</p></td>
                        <td className="tab-row">{user.markCode}</td>
                        <td className="email-col tab-row"><p>{user.email}</p></td>
                        <td className="tab-row tab-row">{(user.status).charAt(0).toUpperCase() + (user.status).slice(1)}</td>
                        <td className="user-kind-col tab-row"><p>{(user.userType).charAt(0).toUpperCase() + user.userType.slice(1)}</p></td>
                        <td className="action-col tab-row">
                          <Button
                            variant="link"
                            onClick={() => handleEdit(user)}
                          >
                            <FaEdit />
                          </Button>
                        </td>
                        <td className="action-col">
                          <Button
                            variant="link"
                            onClick={() => handleDelete(user)}
                          >
                            <FaTrash color="red" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Modal show={isUserCreatorVisible} onHide={handleButtonCancel}>
                <Modal.Header closeButton>
                  <Modal.Title>
                    {isEditMode ? "Editar" : "Crear"} un nuevo usuario
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group controlId="formName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="formUser">
                      <Form.Label>Usuario</Form.Label>
                      <Form.Control
                        type="text"
                        value={user}
                        onChange={handleUserChange}
                        disabled={isEditMode}
                      />
                    </Form.Group>
                    <Form.Group controlId="formCode">
                      <Form.Label>Codigo marcación</Form.Label>
                      <Form.Control
                        type="text"
                        value={markCode}
                        onChange={handleMarcaChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="formPassword">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="formMail">
                      <Form.Label>Correo</Form.Label>
                      <Form.Control
                        type="email"
                        value={mail}
                        onChange={handleMailChange}
                        onBlur={validateEmail}
                      />
                      {emailError && (
                        <div className="errorText">{emailError}</div>
                      )}
                    </Form.Group>
                    <Form.Group controlId="formEstado">
                      <Form.Label>Estado</Form.Label>
                      <Form.Control
                        as="select"
                        value={estado}
                        onChange={handleEstadoChange}
                      >
                        <option value="">Estado</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="formUserKind">
                      <Form.Label>Tipo de usuario</Form.Label>
                      <Form.Control
                        as="select"
                        value={userKind}
                        onChange={handleUserKindChange}
                      >
                        <option value="">Tipo de usuario</option>
                        <option value="administrador">Administrador</option>
                        <option value="farmacia">Farmacia</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="farmacia-admon">Farmacia admin</option>
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="primary"
                    onClick={handleSaveChanges}
                    disabled={!isChanged}
                  >
                    {isEditMode ? "Guardar cambios" : "Crear"}
                  </Button>
                  <Button variant="secondary" onClick={handleButtonCancel}>
                    Cancelar
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal
                show={isDeleteConfirmVisible}
                onHide={() => setIsDeleteConfirmVisible(false)}
              >
                <Modal.Header closeButton>
                  <Modal.Title>
                    ¿Estás seguro que quieres borrar a {userToDelete?.username}?
                  </Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                  <Button variant="danger" onClick={confirmDelete}>
                    Aceptar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsDeleteConfirmVisible(false)}
                  >
                    Cancelar
                  </Button>
                </Modal.Footer>
              </Modal>
              <Modal
                show={messageModalVisible}
                onHide={() => setMessageModalVisible(false)}
                size="lg"
                centered
              >
                <Modal.Header
                  closeButton
                  className={
                    successMessageVisible
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }
                >
                  <Modal.Title>
                    {successMessageVisible ? "Éxito" : "Error"}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body
                  className={
                    successMessageVisible
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }
                >
                  {message}
                </Modal.Body>
              </Modal>

              {/* {successMessageVisible && (
              <div className="alert alert-success" role="alert">
                {message}
              </div>
            )}
            {errorMessageVisible && (
              <div className="alert alert-danger" role="alert">
                {message}
              </div>
            )} */}
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default CreateUserPage;
