<template>
  <b-card no-body >
    <div slot="header">
      <i class="icon-directions"></i> Store Settings
      <div class="card-header-actions">
        <b-link href="#" class="card-header-action btn-setting">
          <i class="icon-settings"></i>
        </b-link>
        <b-link class="card-header-action btn-minimize" v-b-toggle.collapse1>
          <i class="icon-arrow-up"></i>
        </b-link>
        <b-link href="#" class="card-header-action btn-close" >
          <i class="icon-close"></i>
        </b-link>
      </div>
    </div>
    <b-collapse id="collapse1" visible>
      <b-card-body>
        <b-col md="12" class="text-left">
          <form @submit="postStore" >
            <b-form-group>
              <label for="company">Company Name</label>
              <b-form-input type="text"  v-model="form.name" ></b-form-input>
            </b-form-group>
            <b-form-group>
              <label for="vat">Email </label>
              <b-form-input type="text" class="form-control is-invalid" id="inputError2" required v-model="form.email"></b-form-input>
              <b-form-invalid-feedback>(This is where your contact forms will be delivered)</b-form-invalid-feedback>
            </b-form-group>
            <b-form-group>
              <label for="street">Domain Name</label>
              <b-form-input type="text"   v-model="form.domain_name"></b-form-input>
            </b-form-group>
            <b-row>
              <b-col sm="12">
                <b-form-group>
                  <label for="country">Facebook URL</label>
                  <b-input-group>
                    <b-form-input type="text"   v-model="form.facebook"></b-form-input>
                    <b-input-group-append>
                      <b-button variant="primary"><i class="fa fa-facebook" /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col sm="12">
                <b-form-group>
                  <label for="city">Instagram URL</label>
                  <b-input-group>
                    <b-form-input type="text"   v-model="form.instagram"></b-form-input>
                    <b-input-group-append>
                      <b-button variant="primary"><i class="fa fa-instagram" /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col sm="12">
                <b-form-group>
                  <label for="country">Linkedin URL</label>
                  <b-input-group>
                    <b-form-input type="text"   v-model="form.linkedin"></b-form-input>
                    <b-input-group-append>
                      <b-button variant="primary"><i class="fa fa-linkedin" /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col sm="12">
                <b-form-group>
                  <label for="country">Twitter URL</label>
                  <b-input-group>
                    <b-form-input type="text"   v-model="form.twitter"></b-form-input>
                    <b-input-group-append>
                      <b-button variant="primary"><i class="fa fa-twitter" /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col sm="12">
                <b-form-group>
                  <label for="country">Telegram URL</label>
                  <b-input-group>
                    <b-form-input type="text"   v-model="form.telegram"></b-form-input>
                    <b-input-group-append>
                      <b-button variant="primary"><i class="fa fa-telegram" /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
            </b-row>
            <div class="form-actions">
              <b-button v-if="!loading" type="submit" variant="warning" class="mr-2">Save changes</b-button>
              <b-button v-if="loading" variant="warning" class="mr-2" disabled>Save changes <i class="fa fa-spinner fa-spin"/></b-button>
            </div>
          </form>
        </b-col>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

export default {
  name:'Settings',
  components: {
  },

  data(){
    return {
      loading:false,
      form:{}
    }
  },

  created(){
    this.fetchStore()
  },

  methods: {
    fetchStore(){
      axios.get(config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.form = response.data
          serverBus.$emit('storeSettingsAddresses', response.data.addresses)
        }
      })
      .catch((error) => {
      })
    },

    postStore(e){
      this.loading = true
      e.preventDefault();
      axios.put(config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid, this.form, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.$toasted.show('Store settings updated', { 
            position:'top-right', 
            duration: 5000,
            type: 'success',
            closeOnSwipe: true
          })
          this.loading = false
        }
      })
      .catch((error) => {
        error.response.data.map((m) => {
          this.$toasted.show(m, { 
            position:'top-right', 
            duration: 5000,
            type: 'error',
            closeOnSwipe: true
          })
          this.loading = false
        })
      })
    }
  }
}
</script>
