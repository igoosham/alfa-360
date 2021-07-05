import connectionsProvider from "./schema-connections.js";

var modelProvider = {};

export default modelProvider;

var _diagram = null;
var kendo = window.kendo;

modelProvider.init = function(diagram) {
  _diagram = diagram;
  // connectionsProvider.init(diagram);

  // console.log("modelProvider.init _diagram.id =", _diagram.id);
};

modelProvider.renderModel = function(r_model) {
  const _model = Object.assign({}, r_model);

  let _index = _diagram.shapes.findIndex(
    (shape) => shape.id === _model.SHAPE_ID
  );

  //let _shape = _diagram.shapes.find(shape => shape.id === r_model.SHAPE_ID);
  let _shape = _diagram.shapes[_index];

  let _rectWidth = 20;
  const _modelCaptionSize = 16; // вынести в параметры
  const _modelFontSize = 12; // вынести в параметры
  const _leftRectWidth = 30; // вынести в параметры

  var _secondColumnY = getSecondColumnY();

  if (_shape) {
    console.log("schema exists");
    // модель существует - ререндер изменений:
    // удалить ее связи
    connectionsProvider.removeConnections([_shape]);
    // удалить модель
    _diagram.remove(_diagram.shapes[_index], false);
    _shape = addNewShape();
    connectionsProvider.renderConnections([_shape]);
  } else {
    _shape = addNewShape();
  }

  return _shape;

  function addNewShape() {
    let shape;

    if (_model.SHAPE_ID) {
      shape = new kendo.dataviz.diagram.Shape({
        id: _model.SHAPE_ID,
        dataItem: _model,
        visual: visualTemplate,
        x: _model.X,
        y: _model.Y,
      });
    } else {
      shape = new kendo.dataviz.diagram.Shape({
        dataItem: _model,
        visual: visualTemplate,
        x: _model.X,
        y: _model.Y,
      });
      _model.SHAPE_ID = shape.id;
    }

    // отрисовка прямоугольников и текстовых блоков
    shape.redrawVisual();
    // отрисовка коннекторов
    let connector = createConnectorArray(shape);
    shape.redraw({
      connectors: connector,
    });
    //console.log("connector", connector);
    _diagram.addShape(shape, false);

    return shape;
  }

  function createConnectorArray(shape) {
    // создание массива коннекторов connectors
    var connectors = [];
    for (let i = 0; i < shape.connectorOffSet.length; i++) {
      // ф. рассчета позиции коннектора
      var posFunc = function(shape) {
        // базовая точка для рассчета сдвига
        let bp = { x: 0, y: 0 };
        // поиск этой. точки в массиве точек модели
        let index = shape.connectorOffSet.findIndex((x) => x.name == this.name);
        // определение базовой точки
        //if (shape.dataItem.obj == this.name) {
        if (shape.dataItem.objAsString == this.name) {
          bp = shape.bounds().topLeft();
        } else {
          bp = shape.bounds().topRight();
        }
        // расчет позиции коннектора
        let pos = shape._transformPoint(
          new kendo.dataviz.diagram.Point(
            bp.x,
            bp.y + shape.connectorOffSet[index].OffSet + 7
          )
        );
        return pos;
      };
      // добавление точки в массив коннекторов
      connectors.push({
        name: shape.connectorOffSet[i].name,
        position: posFunc,
      });
    }
    return connectors;
  }

  function visualTemplate(options) {
    //console.log(_model.objAsString);

    var g = new kendo.dataviz.diagram.Group();
    var dataItem = options.dataItem;

    // console.log({ dataItem });

    // определение ширины прямоугольника модели
    if (this._bounds) {
      if (_rectWidth != this._bounds.width) {
        _rectWidth = this._bounds.width + 10;
      }
    }

    // массив координат сдвига коннекторов
    this.connectorOffSet = [];
    // сдвиг по Y для иконок
    var iconsY = 39;
    // сдвиг по Y для последующего элемента группы
    var textY = 10; // вынести в параметры

    var lineSource = [];
    for (let i in dataItem.ListMemberModel) {
      if (
        dataItem.ListMemberModel[i].linkOf == null ||
        dataItem.ListMemberModel[i].linkOf.IsFK
      ) {
        lineSource.push(dataItem.ListMemberModel[i]);
      }
    }

    // высота прямоугольника членов модели
    var rectHeigt = lineSource.length * 20;

    // тултип содержащий ошибку компиляции если она есть
    if (dataItem.IS_COMPILE_ERROR) {
      g.drawingElement.options.tooltip = {
        content: dataItem.LAST_ERROR,
        position: "bottom",
        width: _rectWidth * 2,
        shared: true,
      };
    }

    // caption rect - "рамочный" прямоугольник на который накладывается все остальное
    g.append(
      new kendo.dataviz.diagram.Rectangle({
        width: _rectWidth, //options.width,
        height: rectHeigt + 2 * 32,
        stroke: {
          width: 0,
        },
        // stroke: {
        //   color: "#1976d2",
        //   width: 1,
        // },
        fill: this.isSelected ? "#1976d2" : "#FAFAFA", //"white", //"#808080",
        x: 0,
        y: 0,
      })
    );

    // сдвиг по X для последующей иконки
    var nextIconX = 5;

    // иконка ошибки компиляции
    if (dataItem.IS_COMPILE_ERROR) {
      g.append(
        new kendo.dataviz.diagram.Image({
          source: this.isSelected
            ? "Content/Status/compile-error-white-24.png"
            : "Content/Status/compile-error-red-24.png",
          x: nextIconX,
          y: rectHeigt + iconsY,
          width: 24,
          height: 24,
        })
      );
      nextIconX += 29;
    }

    // иконка деплоя
    if (dataItem.IS_DEPLOY) {
      g.append(
        new kendo.dataviz.diagram.Image({
          source: "Content/Tools/Icons/deploy-128.svg", //this.isSelected ? "Content/Status/deploy-white-24.png" : "Content/Status/deploy-black-24.png",
          x: nextIconX,
          y: rectHeigt + iconsY,
          width: 24,
          height: 24,
        })
      );
      nextIconX += 29;
    }

    // caption rect underline
    g.append(
      new kendo.dataviz.diagram.Rectangle({
        width: _rectWidth - 4,
        height: 3,
        stroke: {
          width: 0,
        },
        fill: this.isSelected ? "white" : "#1976d2",
        x: 2,
        y: 33,
      })
    );

    // big rect
    g.append(
      new kendo.dataviz.diagram.Rectangle({
        width: _rectWidth - 4,
        height: rectHeigt,
        stroke: {
          width: 0,
        },
        fill: this.isSelected ? "#1976d2" : "white",
        x: 2,
        y: 37,
      })
    );

    // _model Caption block
    let txtbl = new kendo.dataviz.diagram.TextBlock({
      text: `${dataItem.objAsString} (${dataItem.alternate.alt})`,
      x: 5,
      y: textY - 3,
      fontSize: _modelCaptionSize,
      fontWeight: 600,
      fill: this.isSelected ? "white" : "#1976d2", //"#eae4d4" : "#1c262c",
    });

    g.append(txtbl);

    textY += 30; // вынести в параметры

    for (let i in lineSource) {
      // Name block
      let txtbl1 = new kendo.dataviz.diagram.TextBlock({
        text: lineSource[i].SignModel.MemberName,
        x: _leftRectWidth,
        y: textY,
        fontSize: _modelFontSize,
        fill: this.isSelected ? "white" : "#1976d2",
      });
      g.append(txtbl1);
      // Type block
      let max_size = lineSource[i].SignModel.inBase.maxSize;

      let txtbl2 = new kendo.dataviz.diagram.TextBlock({
        text: max_size
          ? `${lineSource[i].SignModel.MemberTypeAsString} (${max_size})`
          : lineSource[i].SignModel.MemberTypeAsString,
        x: _secondColumnY,
        y: textY,
        fontSize: _modelFontSize,
        fill: this.isSelected ? "white" : "#1976d2",
      });
      g.append(txtbl2);

      // PK block
      if (lineSource[i].SignModel.pkKey) {
        let txtbl3 = new kendo.dataviz.diagram.TextBlock({
          text: "PK",
          x: 7,
          y: textY,
          fontSize: _modelFontSize,
          fontWeight: "bold",
          fill: this.isSelected ? "white" : "#1976d2",
        });
        g.append(txtbl3);

        this.connectorOffSet.push({
          name: dataItem.objAsString,
          OffSet: textY,
        });
      }
      // FK block
      if (lineSource[i].linkOf && lineSource[i].linkOf.IsFK) {
        let txtbl3 = new kendo.dataviz.diagram.TextBlock({
          text: "FK",
          x: 7,
          y: textY,
          fontSize: _modelFontSize,
          fontWeight: "bold",
          fill: this.isSelected ? "white" : "#1976d2", //"#1c262c" : "white"
        });
        g.append(txtbl3);

        // let type = lineSource[i].linkOf.MemberName;
        // let toClass = type.substring(5, type.length);
        // this.connectorOffSet.push({ name: toClass, OffSet: textY });
        this.connectorOffSet.push({
          name: lineSource[i].linkOf.MemberName,
          OffSet: textY,
        });
      }

      textY += 20;
    }

    return g;
  }

  function getSecondColumnY() {
    var calcNames = [];

    for (let i in _model.ListMemberModel) {
      if (
        _model.ListMemberModel[i].linkOf == null ||
        _model.ListMemberModel[i].linkOf.IsFK
      ) {
        calcNames.push(_model.ListMemberModel[i]);
      }
    }

    var calcShape = new kendo.dataviz.diagram.Shape({
      dataItem: calcNames,
      visual: visualCalc,
    });

    return Math.round(calcShape.options.width);
  }

  function visualCalc(options) {
    const _leftRectWidth = 32; // вынести в параметры

    var g = new kendo.dataviz.diagram.Group();
    var dataItem = options.dataItem;

    var textY = 35; // вынести в параметры

    var rectHeigt = dataItem.length * 20;

    let rect = new kendo.dataviz.diagram.Rectangle({
      width: options.width - _leftRectWidth + 10,
      height: rectHeigt,
      stroke: {
        width: 0,
      },
      fill: "#FF0000",
    });

    g.append(rect);

    for (let i in dataItem) {
      g.append(
        new kendo.dataviz.diagram.TextBlock({
          text: dataItem[i].SignModel.MemberName,
          x: _leftRectWidth + 5,
          y: textY,
          fontSize: _modelFontSize,
          fill: "white",
        })
      );

      textY += 20; // вынести в параметры
    }

    return g;
  }
};
