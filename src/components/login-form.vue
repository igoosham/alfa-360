<template>
  <v-row justify="center" class="mt-5">
    <v-col cols="12" sm="10" md="6" lg="4">
      <v-form
        @submit.prevent="submitForm"
        ref="form"
        v-model="valid"
        :disabled="isDisabled || !connected"
        style="max-width: 550px;"
      >
        <label for="login">Login:</label>

        <v-text-field
          v-model="login"
          :rules="[rules.required, rules.min4]"
          hint="at least 4 characters"
          required
        ></v-text-field>

        <label for="password">Password:</label>

        <v-text-field
          v-model="password"
          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[rules.required, rules.min6]"
          :type="showPass ? 'text' : 'password'"
          hint="at least 6 characters"
          @click:append="showPass = !showPass"
          required
        ></v-text-field>

        <div class="mt-5">
          <span>
            <v-slide-x-reverse-transition>
              <v-tooltip v-if="!valid" bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    class="my-0"
                    v-bind="attrs"
                    @click="resetForm"
                    v-on="on"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>Refresh form</span>
              </v-tooltip>
            </v-slide-x-reverse-transition>

            <v-btn
              color="primary"
              type="submit"
              :disabled="isDisabled || !valid"
            >
              Log in
            </v-btn>
          </span>
        </div>
      </v-form>
    </v-col>
  </v-row>
</template>

<script>
import { required, min4, min6 } from "@/files/validation-rules.js";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoginForm",

  data() {
    return {
      valid: true,
      isDisabled: false,
      login: "",
      password: "",
      showPass: false,
      rules: {
        required,
        min4,
        min6
      }
    };
  },

  computed: {
    ...mapGetters({
      connected: "getIsConnected"
    })
  },

  methods: {
    ...mapActions(["authenticateWithPassword"]),

    resetForm() {
      this.login = this.password = "";
    },

    submitForm() {
      if (!this.valid) return;

      this.isDisabled = true;

      this.authenticateWithPassword({
        login: this.login,
        password: this.password
      });
    }
  }
};
</script>
