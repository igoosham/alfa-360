<template>
  <v-navigation-drawer v-model="isVisible" app clipped floating>
    <v-treeview
      @update:active="onActiveUpdate"
      :open="initiallyOpen"
      :items="items"
      activatable
      item-key="id"
      open-on-click
    >
      <template v-slot:prepend="{ item }">
        <v-icon>
          {{ item.icon }}
        </v-icon>
      </template>
      <template v-slot:label="{ item }">
        <span>
          {{ item.name }}
        </span>
      </template>
    </v-treeview>
  </v-navigation-drawer>
</template>

<script>
import { multiDimentionFind } from "@/files/funcs.js";

export default {
  name: "NavDrawerMain",

  props: {
    visible: {
      type: Boolean,
      requered: true,
      default: false
    }
  },

  data: () => ({
    isVisible: false,
    initiallyOpen: [],
    items: [
      {
        id: "tables",
        name: "Таблицы",
        icon: "mdi-table",
        component: "DataGrid",
        children: []
      },
      {
        id: "forms",
        name: "Формы",
        icon: "mdi-form-select",
        component: "Tiles",
        children: [{ name: "Меню", alt: "mn", id: "2222" }]
      },
      {
        id: "chats",
        name: "Чаты",
        icon: "mdi-chat",
        component: "UnderConstruction",
        children: [
          { name: "admin", alt: "admin", id: "2222" },
          { name: "tramp", alt: "tramp", id: "1111" }
        ]
      },
      {
        id: "tools",
        name: "Инструменты",
        icon: "mdi-tools",
        component: "UnderConstruction",
        children: [
          {
            name: "Схема данных",
            alt: "scheme",
            id: "scheme",
            component: "ToolsSchema"
          }
        ]
      }
    ]
  }),

  computed: {
    tableItems() {
      const menuData = this.$store.getters.getMenuData;

      if (menuData && menuData.raw && menuData.raw.data) {
        const menus = menuData.raw.data.map(x => {
          const alt = ("" + x.URL).split(";")[0].split("=")[2];
          return {
            id: x.MENU_ID,
            // id: Symbol(),
            menu_id: x.MENU_ID,
            parent_id: x.PARENT_MENU_ID,
            seq: x.SEQ,
            name: x.NAME,
            alt: alt
          };
        });

        const tables = menus
          .filter(x => !x.parent_id)
          .sort((a, b) => a.seq - b.seq);

        tables.forEach(x => {
          x.children = menus
            .filter(y => y.parent_id === x.menu_id)
            .sort((a, b) => a.seq - b.seq);
        });

        return tables || [];
      }

      return [];
    }
  },

  watch: {
    visible: function() {
      this.isVisible = !this.isVisible;
    },
    tableItems: function(newItems, oldItems) {
      // console.log("tableItems:", { new: newItems, old: oldItems });
      this.items.find(x => x.id === "tables").children = newItems;
      if (!oldItems.length) {
        // this.initiallyOpen = ["tables"];
        this.initiallyOpen = ["tools"];

        this.isVisible = true;
      }
    }
  },

  mounted() {
    this.items.find(x => x.id === "tables").children = this.tableItems;
  },

  methods: {
    onActiveUpdate([id]) {
      // console.log("onActiveUpdate e:", id);

      let item, root;
      [item, root] = multiDimentionFind(this.items, id, "id", "children", true);

      //console.log({ a });

      if (item.alt) {
        this.$emit("drawerSelect", {
          alt: item.alt,
          title: item.name,
          icon: root.icon,
          component: item.component || root.component
        });
      }
    }
  }
};
</script>
