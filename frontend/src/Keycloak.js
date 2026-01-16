import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8180/",
  realm: "order-system-realm",
  clientId: "order-system-client",
});

export default keycloak;