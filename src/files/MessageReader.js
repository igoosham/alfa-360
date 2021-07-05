/*
01 - тип транзакции

EA...FA  - шапка 234...250
EC...FC  - модель 236...252
EE...FE  - аспект 238...254
EF...FF  - блок данных 239...255
EB...FB  - строка данных 235...251
ED...FD  - блок вложенные данные 237...253
*/
import { ASPECT_MEMBER } from "@/files/Aspect.js";
import AtomicType from "@/files/AtomicType.js";

export default class MessageReader {
  type = null;
  header = {};
  model = [];
  data = [];

  _bcd2arr = (int) => [int >>> 4, int & 15];

  _getValueLength = (int) => {
    if (int === 0) return 0;
    if (int === 1) return this._array[this._cursor++];
    if (int > 1)
      return this._array
        .slice(this._cursor, (this._cursor += int))
        .reduce((ac, val, i, ar) => ac + (val << (8 * (ar.length - i - 1))), 0);
  };

  _next = () =>
    this._cursor + 1 < this._array.length
      ? this._array[this._cursor + 1]
      : null;

  _peek = () => this._array[this._cursor++];

  _poke = () => this._array[this._cursor];

  _readUnit(skipFirstByte) {
    const errCursor = this._cursor;

    if (skipFirstByte) this._cursor++;

    let atomicType,
      lengthOfValueLength,
      valueLength,
      subAr = [];

    [atomicType, lengthOfValueLength] = this._bcd2arr(
      this._array[this._cursor++]
    );

    valueLength = this._getValueLength(lengthOfValueLength);

    if (valueLength)
      subAr = this._array.slice(this._cursor, (this._cursor += valueLength));

    let obj;
    try {
      obj = new AtomicType(atomicType, subAr).toObject();
    } catch (e) {
      console.error("parsing error:", e, "at", errCursor);
      obj = { value: null };
    }

    return obj;
  }

  _readAspect() {
    let aspectObj = {};
    let aspectName = ASPECT_MEMBER[this._array[this._cursor++]].name;
    // console.log("aspect type:", aspectName);

    aspectObj[aspectName] = [];
    let aspectMember;
    while (this._array[this._cursor] !== 254) {
      aspectMember = this._readUnit().value;
      aspectObj[aspectName].push(aspectMember);
      // console.log(this._cursor, aspectMember);
    }
    this._cursor++;
    return aspectObj;
  }

  _readModel() {
    let columnName,
      aspect,
      aspects,
      model = [];
    // console.log(`reading model start position: ${this._cursor}, value: ${this._array[this._cursor]}`);
    // console.log(this._array[this._cursor]);

    while (
      this._array[this._cursor] !== 252 &&
      this._cursor < this._array.length
    ) {
      aspects = {};
      columnName = { name: this._readUnit(true).value };
      // console.log("columnName:", columnName);
      // console.log(`after reading columnName position: ${this._cursor}, value: ${this._array[this._cursor]}`);

      if (this._array[this._cursor] === 238) {
        // reading aspects
        // console.log(`reading aspects start position: ${this._cursor}, value: ${this._array[this._cursor]}`);
        while (this._array[this._cursor] === 238) {
          this._cursor++;
          aspect = this._readAspect();
          aspects = Object.assign(aspects, aspect);
          // console.log({aspects});
        }
      }

      model.push(Object.assign({}, columnName, aspects));
    }
    // console.log(this._array[this._cursor]);
    // console.log("reading model end;");
    return model;
  }

  _readData(model) {
    let item,
      i,
      json,
      data = [];
    // console.log(`reading data start position: ${this._cursor}, value: ${this._array[this._cursor]}`);
    while (this._poke() !== 255 && this._cursor < this._array.length) {
      i = 0;
      json = {};

      // console.log(
      //   `reading data row start position: ${
      //     this._cursor
      //   }, value: ${this._poke()}`
      // );

      if (this._peek() === 235) {
        // reading data row

        while (this._poke() !== 251 && this._cursor < this._array.length) {
          // console.log({ cursor: this._cursor });
          item = this._readUnit(true);
          if (this._poke() === 170) {
            // console.log(this._cursor);
            var valArr = [item];
            while (this._poke() === 170) {
              valArr.push(this._readUnit(true));
            }
            // console.log({ valArr });
          }
          // console.log({ item });
          if (model[i]) {
            json[model[i].name] = valArr ? valArr : item.value;
          }
          i++;
          // console.log({json});
          // console.log(`reading data item finished. position: ${this._cursor}, value: ${this._array[this._cursor]}`);
        }
        data.push(json);
      }
      this._cursor++;
    }
    // console.log("reading data end;")
    return data;
  }

  _readTotalRowCount() {
    let lengthOfValueLength, valueLength;
    [, lengthOfValueLength] = this._bcd2arr(this._array[this._cursor++]);
    valueLength = this._getValueLength(lengthOfValueLength);
    return this._getValueLength(valueLength);
  }

  _readHeader() {
    const alt = this._readUnit().value;
    const alias = this._readUnit().value;
    const totalRowCount = this._readTotalRowCount();
    //console.log("totalRows:", this.totalRowCount);
    let err, dbAnswer;
    if (this._poke() !== 250) {
      err = this._readUnit().value;
    }
    if (this._poke() !== 250) {
      dbAnswer = this._readUnit().value;
    }
    return {
      alt: alt,
      alias: alias,
      totalRowCount: totalRowCount,
      err: err,
      dbAnswer: dbAnswer,
    };
  }

  _cursor = 0;

  constructor(uint8array) {
    this._array = uint8array;
    // package type
    this.type = this._peek();

    // package header
    if (this._peek() === 234) {
      this.header = this._readHeader();
      // console.log("after header position:", this._cursor);
      if (this._peek() !== 250) {
        console.error("unknown header entry at:", this._cursor);
        return this;
      }
    }

    // package model
    if (this._peek() === 236) {
      this.model = this._readModel();
      // console.log("after model:", this._peek());
      if (this._peek() !== 252) {
        console.error("unknown model entry at:", this._cursor);
        return this;
      }
    }

    // package data
    if (this._peek() === 239) {
      this.data = this._readData(this.model);

      if (this._peek() !== 255) {
        console.error("unknown data entry at:", this._cursor);
        return this;
      }
    }

    // attachment(s)
    this.attachments = [];
    let attach;

    while (this._cursor <= this._array.length) {
      attach = {};

      if (this._peek() === 237) {
        attach.type = this._peek();

        // attachment header
        if (this._peek() === 234) {
          attach.header = this._readHeader();
          // console.log("after header position:", this._cursor);
          if (this._peek() !== 250) {
            console.error("unknown header entry at:", this._cursor);
            return this;
          }
        }

        // attachment model
        if (this._peek() === 236) {
          attach.model = this._readModel();
          // console.log("after model:", this._peek());
          if (this._peek() !== 252) {
            console.error("unknown model entry at:", this._cursor);
            return this;
          }
        }

        // attachment data
        if (this._peek() === 239) {
          attach.data = this._readData(attach.model);

          if (this._peek() !== 255) {
            console.error("unknown data entry at:", this._cursor);
            return this;
          }
        }

        this.attachments.push(attach);
      }
    }
    // console.log("model:", this.model);
    // console.log("data:", this.data);
  }

  toObject() {
    return {
      type: this.type,
      header: this.header,
      model: this.model,
      data: this.data,
      attachments: this.attachments,
    };
  }

  destroy() {
    this.attachments = null;
    this.data = null;
    this.model = null;
    this.header = null;
    this._array = null;
    this._cursor = null;
  }
}
