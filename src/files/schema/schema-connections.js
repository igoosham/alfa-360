var connectionsProvider = {};

export default connectionsProvider;

function createConnection(from_connector, to_connector) {
  // console.log("createConnection:", { from_connector, to_connector });

  const kendo = window.kendo;
  let connection = kendo.dataviz.diagram.Connection;
  let con = new connection(from_connector, to_connector, {
    stroke: {
      color: "#1976d2",
    },
    type: "cascading",
    startCap: {
      type: "FilledCircle",
      fill: { color: "#1976d2" },
    },
    endCap: {
      type: "ArrowEnd",
      fill: { color: "#1976d2" },
    },
    editable: false,
    selection: {
      handles: {
        fill: { color: "#FFEB3B" },
        stroke: { color: "#1976d2" },
        height: 5,
        width: 5,
      },
    },
  });

  return con;
}

connectionsProvider.removeConnections = function(diagram, shapes) {
  if (!Array.isArray(shapes)) {
    // удаление всех связей
    console.warn("removing all connections");
    diagram.remove(diagram.connections);
  } else {
    // удаление связей переданного массива моделей
    console.warn("removing connections related with selected shapes");
    shapes.forEach((shape) => {
      let connectionsToRemove = diagram.connections.filter(
        (x) => x.from.shape.id === shape.id || x.to.shape.id === shape.id
      );
      diagram.remove(connectionsToRemove);
    });
  }
};

/// shapes - массив моделей для рендера связей
connectionsProvider.renderConnections = function(diagram, shapes) {
  if (!shapes) throw new Error("No shapes provided");

  // console.log("renderConnections:", { shapes });

  // собираем все коннекторы моделей в один массив
  let all_connectors = [];
  shapes.forEach((shape) => {
    shape.connectors.forEach((connector) => {
      all_connectors.push(connector);
    });
  });

  // console.log({ all_connectors });
  // перебираем коннекторы
  all_connectors.forEach((connector) => {
    if (
      connector.options.name.toLowerCase() ===
      connector.shape.dataItem.objAsString.toLowerCase()
    ) {
      let to_connectors = all_connectors.filter(
        (c) =>
          c.options.name.toLowerCase() ===
            connector.options.name.toLowerCase() &&
          c.options.name.toLowerCase() !==
            c.shape.dataItem.objAsString.toLowerCase()
      );
      to_connectors.forEach((c) => {
        const con = createConnection(connector, c);
        diagram.addConnection(con, false);
      });
    }
  });

  return;
};
