const ColumnType = {
  CHidden: 0x00,
  CBool: 0x01,
  CNumber: 0x02,
  CRange: 0x03,
  CImage: 0x04,
  CFile: 0x05,
  CDate: 0x06,
  CDatetimelocal: 0x07,
  CTime: 0x08,
  CMonth_year: 0x09,
  CWeek: 0x0a,
  CText: 0x0b,
  CLongtext: 0x0c,
  CColor: 0x0d,
  CEmail: 0x0e,
  CPassword: 0x0f,
  CTel: 0x11,
  CUrl: 0x12,
  CMoney: 0x13,
};

const ASPECT_MEMBER = {
  1: { name: "PKKey" },
  2: { name: "InBase" },
  3: { name: "LinkOf" },
  4: { name: "Relation" },
  5: { name: "CryptMember" },
  6: { name: "HideForFrond" },
  7: { name: "Reserved2" },
  8: { name: "Reserved3" },
  9: {
    name: "GridLocate",
    members: {
      InGrid: true,
      Visible: true,
      HeadName: "",
      HeadWidth: 50,
      type: ColumnType.CText,
      GetByMember: "",
      IsWrap: true,
    },
  },
  10: {
    name: "EditLocate",
    members: {
      InEdit: true,
      Enabled: true,
      LabelName: "",
      Component: "TextBox",
      DefaultValue: null,
      Requered: false,
      Width: null,
      DataTextField: null,
      DataValueField: null,
    },
  },
  11: { name: "Filter" },
  12: { name: "Footer" },
  13: { name: "Reserved4" },
  14: { name: "Reserved5" },
  15: { name: "Reserved6" },
  16: { name: "Reserved7" },
};

export { ASPECT_MEMBER };