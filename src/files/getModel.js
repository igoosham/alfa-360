const models = {};

models.modela = {
  SHAPE_ID: null,
  X: 100,
  Y: 100,
  objAsString: "Model_A",
  alternate: {
    alt: "moda",
  },
  ListMemberModel: [
    {
      SignModel: {
        MemberName: "MODELA_ID",
        MemberTypeAsString: "number",
        pkKey: true,
        inBase: {
          maxSize: null,
        },
      },
    },
    {
      SignModel: {
        MemberName: "NAME",
        MemberTypeAsString: "varchar2",
        inBase: {
          maxSize: 255,
        },
      },
    },
    {
      linkOf: {
        IsFK: true,
        MemberName: "MODEL_B",
      },
      SignModel: {
        MemberName: "MODELB_ID",
        MemberTypeAsString: "number",
        inBase: {
          maxSize: null,
        },
      },
    },
  ],
};

models.modelb = {
  SHAPE_ID: null,
  X: 500,
  Y: 100,
  objAsString: "Model_B",
  alternate: {
    alt: "modb",
  },
  ListMemberModel: [
    {
      SignModel: {
        MemberName: "MODELB_ID",
        MemberTypeAsString: "number",
        pkKey: true,
        inBase: {
          maxSize: null,
        },
      },
    },
    {
      SignModel: {
        MemberName: "NAME",
        MemberTypeAsString: "varchar2",
        inBase: {
          maxSize: 255,
        },
      },
    },
  ],
};

models.modelc = {
  SHAPE_ID: null,
  X: 0,
  Y: 0,
  objAsString: "Model_C",
  alternate: {
    alt: "modc",
  },
  ListMemberModel: [
    {
      SignModel: {
        MemberName: "MODELC_ID",
        MemberTypeAsString: "number",
        pkKey: true,
        inBase: {
          maxSize: null,
        },
      },
    },
    {
      SignModel: {
        MemberName: "NAME",
        MemberTypeAsString: "varchar2",
        inBase: {
          maxSize: 255,
        },
      },
    },
  ],
};

models.empty = {
  SHAPE_ID: null,
  X: 0,
  Y: 0,
  objAsString: null,
  alternate: {
    alt: null,
  },
  ListMemberModel: [],
};

const emptyMember = {
  SignModel: {
    MemberName: null,
    MemberTypeAsString: null,
    pkKey: false,
    inBase: {
      maxSize: null,
    },
  },
};

function getModel(names) {
  const result = [];

  for (let name of names) {
    result.push(models[name]);
  }

  return result;
}

function getNewModel() {
  return models.empty;
}

function getNewMember() {
  return emptyMember;
}

export { getModel, getNewModel, getNewMember };
