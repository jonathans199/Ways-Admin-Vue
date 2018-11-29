<template>
  <div class="row">
    <div class="col-12 col-md-4">
      <settings/>
    </div>
    <div class="col-12 col-md-8">
      <b-card no-body >
      <nav-top :apiKeys="true"/>
      <b-collapse id="collapse1" visible>
        <b-card-body>
          <h5>
            Here you can update your api keys, the ones that will bring different services to your customers and to your bussines.
          </h5>
          <hr>
          <div class="row">
            <div class="col-4">
              <div class="img-stripe-custom">
                <img src="/img/icons/stripe.png" class="img-fluid img-stripe-custom" alt="">
              </div>
              
            </div>
            <div class="col-8">
              <b-form @submit="postApi">
                <b-form-group validated
                  label="API Key"
                  label-for="normalEmail"
                >
                  <b-form-input id="normalEmail" type="text" placeholder="Enter your api key" required autocomplete="email" v-model="form.apis[0].api"></b-form-input>
                </b-form-group>
                <b-form-group validated
                  label="Secret"
                  label-for="normalPass"
                  description="Please enter your secret.">
                  <b-form-input id="normalPass" type="text" placeholder="Enter your secret" required autocomplete="current-password" v-model="form.apis[0].secret"></b-form-input>
                </b-form-group>
                <div class="form-actions">
                  <b-button v-if="!loading" type="submit" variant="danger" >Save Keys <i class="icon-key" /></b-button>
                  <b-button v-if="loading" variant="danger" class="mr-2" disabled>Save changes <i class="fa fa-spinner fa-spin"/></b-button>
                </div>
              </b-form>
            </div>
          </div>
        </b-card-body>
      </b-collapse>
      </b-card>
    </div>
    
  </div>
</template>

<style>
  .img-stripe-custom {
    /* max-width: 176px; */
    max-height: 176px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<script>
import NavTop from './../Components/NavTop'
import Settings from './../Settings/Settings'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'
import _ from 'lodash'

export default {
  components:{
    'nav-top': NavTop,
    'settings': Settings
  },

  data(){
    return{
      loading: false,
      form:{
        apis: [{
          uuid: '',
          name: 'stripe',
          api: '',
          secret: '',
          api_data_type_id:11
        }]
      }
    }
  },

  created(){
    this.fetchApis()
  },

  methods:{
    fetchApis(){
      axios({
        url: config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/api_datas',
        data: this.form,
        method:'GET',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {


          response.data.map((api) => {
            let obj = this.form.apis.map((local,index) => {
              if(local.name === api.api_type) local = api
              return local
            })
            this.form.apis = obj

          })
          
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
    },

    postApi(e){
      e.preventDefault()
      this.loading = true
      this.form.apis.map((api,index) => {
        let url = config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/api_datas/' + api.uuid
        let method = 'PUT'
        if(!api.uuid){
          url     = config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/api_datas'
          method  = 'POST'
        }

        console.log(api)
        axios({
          url: url,
          data: api,
          method: method,
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 201 || response.status == 200) {
            this.$toasted.show('API Key successfully updated', { 
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
      })
    }
  },
}
</script>

