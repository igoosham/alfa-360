<template>
  <div>
    <data-edit-form
      :title="`${formTitle} - ${params.title}`"
      :items="editFields"
      v-model="dialog"
    />
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="inLoadingState"
      dense
      class="elevation-1"
    >
      <template v-if="items.length" v-slot:body="{ items }">
        <tbody>
          <tr
            @click="onRowClick(indx)"
            v-for="(item, indx) in items"
            :key="indx"
            :class="
              indx === editedIndex
                ? 'blue lighten-5 blue--text text--darken-4'
                : ''
            "
          >
            <template v-for="(field, idx) in Object.keys(item)">
              <td v-if="field === 'actions'" :key="field">
                <v-icon small class="mr-2" @click.stop="editItem(item)">
                  mdi-pencil
                </v-icon>
                <v-icon small @click.stop="deleteItem(item)">
                  mdi-delete
                </v-icon>
              </td>

              <td v-else-if="headers[idx].type === 'CImage'" :key="field">
                <img :src="item[field]" style="height: 36px;margin-top: 4px;" />
              </td>

              <td v-else :key="field">
                {{ item[field] }}
              </td>
            </template>
          </tr>
        </tbody>
      </template>

      <template v-slot:top>
        <v-toolbar flat>
          <v-dialog v-model="dialogDelete" max-width="550px" persistent>
            <v-card>
              <v-card-title class="headline"
                >Are you sure you want to delete selected item?</v-card-title
              >
              <v-progress-linear
                :style="{ visibility: dialogProgresVisibility }"
                class="dialog-progress"
                indeterminate
              ></v-progress-linear>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="closeDelete"
                  :disabled="dialogDisable"
                  >Cancel</v-btn
                >
                <v-btn
                  color="blue darken-1"
                  text
                  @click="deleteItemConfirm"
                  :disabled="dialogDisable"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn color="primary" dark class="mb-2" @click.stop="createItem">
            New Item
          </v-btn>

          <v-divider class="mx-4" inset vertical></v-divider>

          <v-btn color="grey lighten-5" class="mb-2" @click.stop="getData">
            <v-icon small left>mdi-reload</v-icon>
            Refresh
          </v-btn>

          <v-spacer></v-spacer>
          <v-toolbar-title class="text-uppercase pr-5">{{
            params.title
          }}</v-toolbar-title>
        </v-toolbar>
      </template>

      <template v-slot:no-data>
        <v-btn color="primary" @click="getData">
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { mapActions } from "vuex";
  import { mapGetters } from "vuex";
  import DataEditForm from "@/components/data/data-edit-form.vue";

  export default {
    name: "DataGrid",

    components: {
      DataEditForm
    },

    props: {
      params: {
        type: Object,
        required: false,
        default: () => ({
          title: null,
          alt: null
        })
      }
    },

    data() {
      return {
        headers: [],
        items: [],
        baseKeys: [],
        dialog: false,
        dialogDelete: false,
        dialogDisable: false,
        editedIndex: -1,
        editFields: [],
        editedItem: {},
        defaultItem: {},
        crudRequestId: null
      };
    },

    computed: {
      ...mapGetters(["getRawByAlt", "getInLoadingByAlt"]),
      dialogProgresVisibility() {
        return this.dialogDisable ? "visible" : "hidden";
      },
      alt() {
        return this.$props.params.alt;
      },
      formTitle() {
        return this.editedIndex === -1 ? "New Item" : "Edit Item";
      },
      rawData() {
        return this.getRawByAlt(this.alt);
      },
      inLoadingState() {
        return this.getInLoadingByAlt(this.alt);
      },
      crudKeys() {
        return this.baseKeys.length && this.editedIndex !== -1
          ? [
              this.baseKeys.reduce(
                (acc, cur) => (
                  (acc[cur] = this.rawData.data[this.editedIndex][cur]), acc
                ),
                {}
              )
            ]
          : null;
      },
      crudResponse() {
        return this.$store.getters.getCrudResponses(this.crudRequestId);
      }
    },

    watch: {
      params(val) {
        // console.log("watch props in grid:", val);
        if (val) {
          this.getData();
        }
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
      rawData(newData) {
        // console.log("rawData:", { new: newData, old: oldData });

        if (newData && newData.model && newData.data) {
          const headers = newData.model
            .filter(x => x.GridLocate && x.GridLocate[0] && x.GridLocate[1])
            .map(z => ({
              text: z.GridLocate[2] || z.name,
              type: z.GridLocate[4],
              value: z.name
            }));

          const defaultItem = {};

          headers.forEach(x => {
            defaultItem[x.value] = null;
          });

          if (headers.length) {
            headers.push({ text: "Actions", value: "actions", sortable: false });
          }

          this.headers = headers;

          const items = newData.data.map(x => {
            let result = {};
            for (let item of headers) {
              result[item.value] = x[item.value];
            }
            return result;
          });
          // console.log({ items });
          this.items = items;

          this.$nextTick(() => {
            const keys = newData.model.filter(x => x.editForm).map(x => x.name);

            this.baseKeys = keys;

            this.defaultItem = defaultItem;
          });
        } else {
          this.headers = [];
          this.items = [];
          this.baseKeys = [];
          this.defaultItem = {};
        }
      },
      crudResponse(response) {
        if (!response) return;

        console.log("crudResponse", JSON.parse(JSON.stringify(response)));

        const { type, model, attachments, data } = response;

        //const data = response.data[0];
        const editFields = [];

        let editField;
        switch (type) {
          case 3: // after create
            break;
          case 4: // after update
            break;
          case 5: // after delete
            break;
          case 8: // befor insert
          case 11: // befor update
            for (let i = 0; i < model.length; i++) {
              let x = model[i];
              // console.log({ x });
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
              }
            }
            console.log("editFields:", JSON.parse(JSON.stringify(editFields)));
            // console.log({ editedItem });
            this.editFields = editFields;
            // this.dialog = true;
            break;
        }
      }
    },

    mounted() {
      this.getData();
    },

    methods: {
      ...mapActions(["fetchData", "requestCrud", "extractCrudResponse"]),

      onRowClick(indx) {
        // console.log("onRowClick:", indx);
        this.editedIndex = this.editedIndex !== indx ? indx : -1;
      },

      getData() {
        // console.log("getData grid on alt:", this.alt);
        this.fetchData({
          alt: this.alt
        });
      },

      createItem() {
        const hash = this.requestHash();
        this.crudRequestId = hash;
        const header = {
          type: 8,
          alt: this.alt,
          key: hash
        };
        this.requestCrud({ header });
        this.dialog = true;
      },

      requestHash() {
        return "k" + (new Date().getTime() % 10e6);
      },

      editItem(item) {
        // console.log("editItem:", item);

        const indx = this.items.indexOf(item);
        this.editedIndex = indx;
        this.editedItem = this.rawData.data[indx];

        const hash = this.requestHash();
        this.crudRequestId = hash;

        const header = {
          type: 11,
          alt: this.alt,
          key: hash,
          fieldName: this.baseKeys[0],
          fieldValue: this.editedItem[this.baseKeys[0]],
          isSingle: true
        };

        this.requestCrud({ header });
      },

      deleteItem(item) {
        console.log("deleteItem:", item);
        this.editedIndex = this.items.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialogDelete = true;
      },

      deleteItemConfirm() {
        const header = {
          type: 5,
          alt: this.alt,
          key: this.requestHash()
        };

        const body = this.crudKeys;

        console.log("Deleting request:", { header, body });

        this.requestCrud({ header, body });
        this.closeDelete();
      },

      closeDelete() {
        this.dialogDelete = false;
        // this.$nextTick(() => {
        //   this.editedItem = null; //Object.assign({}, this.defaultItem);
        //   this.editedIndex = -1;
        // });
      }
    }
  };
</script>

<style scoped>
  .dialog-progress {
    width: 90%;
    margin: 0 auto;
  }

  .vertical-centered-flex {
    display: flex;
    align-items: center;
  }
</style>
