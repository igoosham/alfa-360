export default class AtomicType {

  _getString = uint8array => uint8array ? new TextDecoder().decode(uint8array) : null;

  _getImage = uint8array => {
    const blob = new Blob([uint8array], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
  };

  _getBool = uint8array => !!uint8array[0];

  t12ora2jsDate = uint8array => {
    console.log("Date array:", uint8array);
    return null;
    // let year = "" + (uint8array[0] - 100) + (uint8array[1] - 100);
    // let month = uint8array[2];
    // let day = uint8array[3];
    // let hour = uint8array[4] - 1;
    // let minute = uint8array[5] - 1;
    // let seconds = uint8array[6] - 1;
    //[0, 34, 121, 72, 184, 115, 216, 8]
    //console.log(`year: ${year}, month: ${month}, day: ${day}, hour: ${hour}, minute: ${minute}, sec: ${seconds}`);
    //return new Date(year, month - 1, day, hour, minute, seconds);
  };

  _getDate = uint8array => {
    //console.log("Date ar:", uint8array);
    const to2d = (int) => int.toString().padStart(2,'0');
    const h = "0x" + uint8array.reverse().reduce((acc, val) => acc + val.toString("16").padStart(2, "0"), '');
    
    //console.log("Date hex:", h, "Date:", +h, "BIDate", window.BigInt(h));

    const d = new Date((+h) / 10000 - 62135596800000);
    //dd.mm.yyyy hh24:mi:ss
    //console.log("Date:", d.toLocaleString());
    return `${to2d(d.getDay())}.${to2d(d.getMonth()+1)}.${to2d(d.getFullYear())} ${to2d(d.getHours()-3)}:${to2d(d.getMinutes())}:${to2d(d.getSeconds())}`;
  }

  _AtomicTypes = {
    0: {
      name: "string", //"Undefined",
      value: this._getString
    },
    1: {
      name: "string",
      value: this._getString
    },
    2: {
      name: "number",
      value: (ar) => +(this._getString(ar))
    },
    3: {
      name: "date",
      value: this._getDate //(ar) => new Date(+("0x" + ar.reduce((acc, val) => acc + val.toString("16").padStart(2, "0"), '')) / 10000 - 62135596800000)
    },
    4: {
      name: "image",
      value: this._getImage
    },
    5: {
      name: "string", //"Custom",
      value: () => null
    },
    6: {
      name: "boolean",
      value: this._getBool
    }
  }

  _value = null;
  _type = null;

  constructor(type, uint8array) {
    try {
      if(type) { 
        this._type = this._AtomicTypes[type].name;
      } 
      if(uint8array.length > 0) {
        this._value = this._AtomicTypes[type].value(uint8array);
      }
    } catch (e){
      console.error(`Error parsing type ${type}: ${e.message}`)
    }
  }

  getType() {
    return this._type;
  }

  getValue() {
    return this._value;
  }

  toObject() {
    return {
      type: this._type,
      value: this._value
    }
  }
}
