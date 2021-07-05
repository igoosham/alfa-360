            editField = {};
            if (x.EditLocate && x.EditLocate[0]) {
              editField.field = x.name;
              editField.enabled = x.EditLocate[1];
              editField.label = x.EditLocate[2];
              editField.component = x.EditLocate[3];
              editField.value = data[x.name];

              if (x.Relation) {
                // && x.Relation[0] === "OneToMany") {
                const listSource = attachments[x.Relation[6]];
                editField.items = listSource.map(row => {
                  return {
                    text: row[x.EditLocate[7]],
                    value: row[x.EditLocate[8]]
                  };
                });
                editField.value = data[x.EditLocate[8]];
              }

              editFields.push(editField);