const required = (v) => !!v || "this field is required";

const min4 = (v) => (v && v.length >= 4) || "minimum 4 charaters";

const min6 = (v) => (v && v.length >= 6) || "minimum 6 charaters";

export { required, min4, min6 };
