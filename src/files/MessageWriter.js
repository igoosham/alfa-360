export default class MessageWriter {
  HeaderTypes = {
    AUTH: 0x01,
    GET: 0x02,
    PUT: 0x03,
    POST: 0x04,
    DELETE: 0x05,
    CHAT: 0x06,
    DICT: 0x07,
    GETBEFORINSERT: 0x08,
    GETBEFORUPDATE: 0x0b,
  };

  AtomicTypes = {
    string: 1,
    number: 2,
    custom: 5,
    boolean: 6,
  };

  separator = 0xff;

  _message = null;

  _2bcd = (type, count) => (type << 4) + count;

  _getByteLength = (int) => Math.ceil(int.toString("16").length / 2);

  _intLength2arr = (int) => {
    let ar = [];
    do {
      ar.push(int - ((int >>= 8) << 8));
    } while (int > 0);
    return ar.reverse();
  };
  //_string2intarr = str => str.split("").map(x => x.charCodeAt(0));
  _string2intarr = (str) => Array.from(new TextEncoder().encode(str));

  _2barr(column, value, type) {
    //console.log(column, value, type);

    if (!value) return [column, 1, 0];

    let t = type || typeof value;

    if (t === "boolean") {
      return value ? [column, 97, 1, 1] : [column, 97, 1, 0];
    }

    //if (t === "string" || t === "number") {
    let at = this.AtomicTypes[t];

    if (t === "number") value += "";

    const encodedValue = this._string2intarr(value);

    const lengthOfLength = this._getByteLength(encodedValue.length);

    const bcd = this._2bcd(at, lengthOfLength);

    return [
      column,
      bcd,
      ...this._intLength2arr(encodedValue.length),
      ...this._string2intarr(value),
    ];
    //}
  }

  _2harr(value) {
    if (!value) return [0];

    let t = typeof value;

    if (t === "boolean") {
      return value ? [1, 1, 1] : [1, 1, 0];
    }

    if (t === "string" || t === "number") {
      if (t === "number") value += "";

      return [
        1,
        ...this._intLength2arr(value.length),
        ...this._string2intarr(value),
      ];
    }
  }

  _setHeader(o) {
    let h = [
      o.type,
      234,
      ...(o.token !== undefined ? this._2harr(o.token) : [0]),
      ...this._2harr(o.alt), // required - alt
      ...(o.key !== undefined ? this._2harr(o.key) : [0]),
      ...(o.fieldName !== undefined ? this._2harr(o.fieldName) : [1, 1, 49]),
      ...(o.fieldValue !== undefined ? this._2harr(o.fieldValue) : [1, 1, 49]),
      ...(o.filter !== undefined ? this._2harr(o.filter) : [0]),
      ...(o.order !== undefined ? this._2harr(o.order) : [0]),
      ...(o.curpage !== undefined ? this._2harr(o.curpage) : [0]),
      ...(o.pageSize !== undefined ? this._2harr(o.pageSize) : [0]),
      ...this._2harr(!!o.isDistinct),
      ...(o.columnName !== undefined ? this._2harr(o.columnName) : [0]),
      ...this._2harr(!!o.isSingle),
      250,
    ];

    //console.log("header as intAr:", h);

    return h;
  }

  _setBody(ar) {
    let o = ar[0];

    let bar = [];
    let columns = [];
    let col = 1;

    bar.push(236); // model start

    for (const property in o) {
      columns.push(col);
      // console.log("property:", property);
      bar = bar.concat(this._2barr(col, property));
      col++;
    }

    bar.push(252); // model end

    let value = null;

    bar.push(239); // data block start

    ar.forEach((x) => {
      col = 1;
      bar.push(235); // data row start
      for (const property in x) {
        value = x[property];
        // console.log("property:", property, "value:", value);
        if (typeof value === "object") {
          // console.log("hex:", this._2barr(col, value ? x[property].value : value, value ? x[property].type : value));
          bar = bar.concat(
            this._2barr(
              col,
              value ? value.value : value,
              value ? value.type : value
            )
          );
        } else {
          //console.log("hex:", this._2barr(col, x[property]));
          bar = bar.concat(this._2barr(col, x[property]));
        }
        col++;
      }
      bar.push(251); // data row end
    });

    bar.push(255); // data block end
    // adding values
    // console.log("body array:", bar);
    return bar;
  }

  constructor(obj) {
    if (typeof obj !== "object")
      throw new Error(
        "MessageWriter constructor accepts an object as a parameter"
      );

    let h = obj.header;

    if (typeof h.alt !== "string" || h.alt.length < 2 || h.alt.length > 6) {
      console.error(h.alt, "error:");
      throw new Error("alt must be a string with length of 2..6");
    }

    if (obj.body) {
      this._message = [...this._setHeader(h).concat(this._setBody(obj.body))];
    } else {
      this._message = [...this._setHeader(h)];
    }

    h = null;
    obj = null;
  }

  get message() {
    return Uint8Array.from(this._message);
  }
}
