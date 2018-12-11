<template>
  <b-card
    header-tag="header"
    footer-tag="footer">
    <div slot="header">
      <i class="icon-people"></i> <strong>  My customers</strong> - <small>  New</small>
    </div>
    <div class="row">
      <nav-left class="col-2" v-if="this.edit_mode" :activeEdit="true"/>
      <nav-left class="col-2" v-if="!this.edit_mode" :activeEdit="false"/>
      <div class="col-10">
        <h4>Customer Info</h4>
        <hr>
        <form @submit="postUser">
        <b-row>
          <b-form-group class="col-12">
            <label for="company">Name</label>
            <b-form-input type="text" placeholder="Name"  v-model="form.name" ></b-form-input>

            <label for="street">Email</label>
            <b-form-input type="text"  placeholder="Email"  v-model="form.email"></b-form-input>
          </b-form-group>

        </b-row>

        <b-form-group>
          <label for="city">Phone</label>
          <b-form-input type="text"  placeholder="Phone"  v-model="form.phone"></b-form-input>
        </b-form-group>

        <b-form-group>
          <label for="city">Notes</label>
          <b-form-textarea 
            id="textarea1"
            v-model="form.notes"
            placeholder="Customer notes"
            :rows="6"
            :max-rows="6"   
            >
          </b-form-textarea>
        </b-form-group>

        <hr>
        <div v-if="!this.edit_mode">
          <div class="form-actions">
            <b-button v-if="!loading" type="submit" variant="warning" class="mr-2">Save changes</b-button>
            <b-button v-if="loading" variant="warning" class="mr-2" disabled>Save changes <i class="fa fa-spinner fa-spin"/></b-button>
            <b-button variant="secondary">Reset</b-button>
          </div>
        </div>
        <div v-else>
          <div class="form-actions">
            <b-button v-if="!loading" type="submit" variant="primary" class="mr-2">Save changes</b-button>
            <b-button v-if="loading" variant="primary" class="mr-2" disabled>Save changes <i class="fa fa-spinner fa-spin"/></b-button>
            <b-button variant="danger" disabled>Delete Customer</b-button>
          </div>
        </div>
        </form>
      </div>
    </div>
  </b-card>
</template>

<style>
  .customer-image {
    max-width: 155px;
    max-height: 155px;
  }
</style>

<script>
import NavLeft from './../Components/NavLeft'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

export default {
  data(){
    return {
      edit_mode: false,
      loading: false,
      address_types: [],
      form: {
        addresses: [{}],
        avatar:'/img/products/default.jpg'
      }
    }
  },

  beforeRouteLeave(to, from , next) {
    this.edit_mode = false
    this.customer_uuid = false
    this.form = {
      addresses: [{}]
    }
    next()
  },

  created(){
    if (this.$route.params.uuid) {
      this.edit_mode = true
      this.customer_uuid = this.$route.params.uuid
      this.fetchCustomer(this.$route.params.uuid)
    }
  },

  components:{
    'nav-left': NavLeft
  },

  methods:{
    fetchCustomer(uuid){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/customers/' + uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.form = response.data
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
    },

    postUser(e){
      e.preventDefault()
      let url
      let method = this.edit_mode ? ('PUT') : ('POST')
      this.loading = true
      if(!this.edit_mode) url =  config.defaultURL + '/api/v1/desk/customers'
      if(this.edit_mode) url  =  config.defaultURL + '/api/v1/desk/customers/' + this.customer_uuid
      axios({
        url:url,
        data:this.form,
        method:method,
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          let msg = this.edit_mode ? ('Customer successfully updated') : ('Customer successfully created')
          this.$toasted.show(msg , { 
            position:'top-right', 
            duration: 5000,
            type: 'default',
            closeOnSwipe: true
          })
          if (!this.edit_mode) this.reset()
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
    },


    reset(){
      this.form = {
        addresses: [{}]
      }
    },

  }
  
}
</script>