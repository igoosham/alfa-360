<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="inLoadingState"
    dense
    class="elevation-1"
  >
    <template v-if="items.length" v-slot:body="{ items }">
      <tbody>
        <tr v-for="(item, indx) in items" :key="indx">
          <td v-for="header in headers" :key="header.value">
            <v-card v-if="Object.keys(item[header.value]).length">
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <div
                        v-for="member in Object.keys(item[header.value])"
                        :key="member"
                      >
                        <span> {{ member }} : </span>
                        <span>
                          {{ item[header.value][member] }}
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-card>
            <!-- {{ JSON.stringify(item[header.value]) }} -->
          </td>
        </tr>
      </tbody>
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-btn color="grey lighten-5" class="mb-2" @click="getData">
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
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Tiles",

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

  data: () => ({
    headers: [],
    items: [],
    baseKeys: [],
    dialog: false,
    dialogDelete: false,
    dialogDisable: false,
    editedIndex: -1,
    editedItem: null,
    defaultItem: {
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0
    }
  }),

  computed: {
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
      return this.alt ? this.$store.getters.getRawByAlt(this.alt) : null;
    },
    inLoadingState() {
      return this.$store.getters.getInLoadingByAlt(this.alt);
    }
  },

  watch: {
    params(val) {
      // console.log("watch props in grid:", val);
      if (val) {
        this.getData();
      }
    },
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
    rawData(newData, oldData) {
      console.log("rawData:", { new: newData, old: oldData });
      if (newData && newData.model && newData.data) {
        const headers = newData.data
          .filter(d => d.PARENT_MENU_ID === null)
          .map(x => {
            return {
              text: x.NAME,
              value: "Parent " + x.MENU_ID
            };
          });
        this.headers = headers;

        const items = [];

        const lines = [];
        headers.forEach((h, i) => {
          lines[i] = newData.data.filter(
            x => "Parent " + x.PARENT_MENU_ID === h.value
          );
        });

        console.log({ lines });

        const max = Math.max(...lines.map(x => x.length));

        for (let i = 0; i < max; i++) {
          const item = {};
          headers.forEach((h, y) => {
            item[h.value] = lines[y][i] || {};
          });
          items.push(item);
        }

        // console.log({ items });
        this.items = items;

        const keys = newData.model
          .filter(x => x.PKKey && x.PKKey[0] && x.PKKey[1])
          .map(x => x.name);
        this.baseKeys = keys;
      } else {
        this.headers = [];
        this.items = [];
      }
    }
  },

  mounted() {
    this.getData();
  },

  methods: {
    ...mapActions(["fetchData", "requestCrud"]),

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

    editItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      // this.dialog = true;
    },

    deleteItem(item) {
      console.log("deleteItem:", item);
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      // this.dialogDisable = true;
      const requestObject = {
        alt: this.alt,
        type: 5,
        key: "" + (new Date().getTime() % 10e6),
        body: this.baseKeys.length
          ? [
              this.baseKeys.reduce(
                (acc, cur) => ((acc[cur] = this.editedItem[cur]), acc),
                {}
              )
            ]
          : [this.editedItem]
      };
      // console.log("Deleting request:", { requestObject });
      this.requestCrud(requestObject);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      // this.$nextTick(() => {
      //   this.editedItem = null; //Object.assign({}, this.defaultItem);
      //   this.editedIndex = -1;
      // });
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem);
      } else {
        this.desserts.push(this.editedItem);
      }
      this.close();
    }
  }
};
</script>
