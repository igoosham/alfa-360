import AtomicType from "@/files/AtomicType.js";

export default function readIsoArray(_array, dataAsArray = false) {
  let _cursor = 0;
  let eof = false;

  const diso = {
    arrayItem: 0xaa,
    aspectStart: 0xee,
    aspectEnd: 0xfe,
    attachStart: 0xed,
    attachEnd: 0xfd,
    dataStart: 0xef,
    dataEnd: 0xff,
    dataRowStart: 0xeb,
    dataRowEnd: 0xfb,
    headerStart: 0xea,
    headerEnd: 0xfa,
    modelStart: 0xec,
    modelEnd: 0xfc,
  };

  const _peek = () => {
    if (_cursor === _array.length - 1) eof = true;
    if (_cursor > _array.length)
      throw new RangeError(
        `cursor overflow: at ${_cursor} of ${_array.length}`
      );
    return _array[_cursor];
  };

  const _peekShift = () => {
    const bite = _peek();
    _cursor++;
    return bite;
  };

  const _readIntAsHex = (int) => {
    if (int === 0) return 0;
    if (int === 1) return _peekShift();
    if (int > 1)
      return _array
        .slice(_cursor, (_cursor += int))
        .reduce(
          (ac, val, i, slice) => ac + (val << (8 * (slice.length - i - 1))),
          0
        );
  };

  const _bcd2arr = (int) => [int >>> 4, int & 15];

  const _readBlock = (skipFirstByte = false) => {
    const errCursor = _cursor;

    if (skipFirstByte) _cursor++;

    let atomicType, lengthOfValueLength;

    [atomicType, lengthOfValueLength] = _bcd2arr(_peekShift());

    const valueLength = _readIntAsHex(lengthOfValueLength);

    const subAr = valueLength
      ? _array.slice(_cursor, (_cursor += valueLength))
      : [];

    let block = {
      type: null,
      value: null,
    };
    try {
      block = new AtomicType(atomicType, subAr).toObject();
    } catch (e) {
      console.error(`binaryReader error: ${e.message} at ${errCursor}`);
    }
    return block;
  };

  const _aspects = {
    1: "PKKey",
    2: "InBase",
    3: "LinkOf",
    4: "Relation",
    5: "CryptMember",
    6: "HideForFrond",
    7: "Reserved2",
    8: "Reserved3",
    9: "GridLocate",
    10: "EditLocate",
    11: "Filter",
    12: "Footer",
    13: "Reserved4",
    14: "Reserved5",
    15: "editFormRelation",
    16: "editForm",
  };

  const _readAspect = () => {
    const name = _aspects[_peekShift()];
    // console.log("aspect type:", name);
    let aspect = {};
    aspect[name] = [];
    while (_peek() !== diso.aspectEnd) {
      aspect[name].push(_readBlock().value);
    }
    _cursor++;
    return aspect;
  };

  const _readRowCount = () => {
    const bcdAr = _bcd2arr(_peekShift());
    return _readIntAsHex(_readIntAsHex(bcdAr[1]));
  };

  const _readHeader = () => {
    const header = {
      alt: _readBlock().value,
      key: _readBlock().value,
      totalRowCount: _readRowCount(),
      err: null,
      dbAnswer: null,
    };

    if (_peek() !== diso.headerEnd) header.err = _readBlock().value;
    if (_peek() !== diso.headerEnd) header.dbAnswer = _readBlock().value;

    if (_peekShift() === diso.headerEnd) return header;

    console.error(
      `header reading error at ${_peek() - 1}. reading ended byte !== ${
        diso.headerEnd
      }`
    );
    return;
  };

  const _readModel = () => {
    const model = [];

    while (_peek() !== diso.modelEnd) {
      let aspects = { name: _readBlock(true).value };

      if (_peek() === diso.aspectStart) {
        while (_peek() === diso.aspectStart) {
          _cursor++;
          const aspect = _readAspect();
          aspects = Object.assign(aspects, aspect);
        }
      }

      model.push(Object.assign({}, name, aspects));
    }

    if (_peekShift() === diso.modelEnd) return model;

    console.error(
      `model reading error at ${_peek() - 1}. reading ended byte !== ${
        diso.modelEnd
      }`
    );
    return;
  };

  const _readData = (model) => {
    const data = [];
    while (_peek() !== diso.dataEnd) {
      let i = 0;
      let dataRow = dataAsArray ? [] : {};
      // reading data row
      if (_peekShift() === diso.dataRowStart) {
        while (_peek() !== diso.dataRowEnd) {
          const value = _readBlock(true).value;
          // check if it's an array of values
          const values = [];
          if (_peek() === diso.arrayItem) {
            values.push(value);
            while (_peek() === diso.arrayItem) {
              values.push(_readBlock(true).value);
            }
          }
          if (model[i]) {
            if (dataAsArray) {
              dataRow[i] = values.length ? values : value;
            }
            dataRow[model[i].name] = values.length ? values : value;
          }
          i++;
        }
        data.push(dataRow);
      }
      _cursor++;
    }
    if (_peekShift() === diso.dataEnd) return data.length > 1 ? data : data[0];

    console.error(
      `data reading error at ${_peek() - 1}. reading ended byte !== ${
        diso.dataEnd
      }`
    );
    return;
  };

  const _iso2object = function() {
    let result = {
      header: {},
      model: [],
      data: [],
    };

    result.type = _peekShift();

    if (!eof && _peek() === diso.headerStart) {
      _cursor++;
      result.header = _readHeader();
    }

    if (!eof && _peek() === diso.modelStart) {
      _cursor++;
      result.model = _readModel();
    }

    if (!eof && _peek() === diso.dataStart && result.model) {
      _cursor++;
      result.data = _readData(result.model);
    }

    return result;
  };

  _cursor = 0;
  // console.log({ _array });

  let result = {};

  try {
    const message = _iso2object();
    Object.assign(result, message);
  } catch (e) {
    console.error("message reading error:", e);
  }

  // console.log("next bite:", _peek(), "at", _cursor);

  // const attachments = [];

  const attachments = {};

  while (!eof) {
    if (!eof && _peek() === diso.attachStart) {
      _cursor++;
      try {
        const attach = _iso2object();
        if (_peekShift() === diso.attachEnd) {
          // console.log("attach read success");
          // attachments.push(attach);
          attachments[attach.header.alt] = attach.data;
        }
      } catch (e) {
        console.error("attachments reading error:", e);
      }
    }
  }

  result.attachments = attachments;

  // console.log("next bite:", _peek(), "at", _cursor);
  // console.log("end of buffer:", eof);

  _array = null;
  return result;
}
