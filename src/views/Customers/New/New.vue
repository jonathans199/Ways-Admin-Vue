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
          <b-form-group class="col-8">
            <label for="company">Name</label>
            <b-form-input type="text" placeholder="Name"  v-model="form.name" ></b-form-input>

            <label for="vat">Last Name</label>
            <b-form-input type="text" placeholder="Last Name"  v-model="form.last_name"></b-form-input>

            <label for="street">Email</label>
            <b-form-input type="text"  placeholder="Email"  v-model="form.email"></b-form-input>
          </b-form-group>

          <b-form-group class="col-4 text-center">
            <img :src="form.avatar" alt="" class="img-thumbnail img-fluid customer-image">
            <br>
            <a v-if="!loading" class="btn btn-sm btn-outline-dark btn-block mt-1" @click="selectInput()">Profile picture <i className="fa fa-camera"/></a>
            <a v-if="loading" class="btn btn-sm btn-outline-dark btn-block mt-1" disabled>Loading <i class="fa fa-spinner fa-spin"/></a>
            <input
              type="file"
              v-on:change="(e) => _handleImageChange(e)"
              id="filestyle-0"
              tabIndex="-1"
              style="display:none"
            /> 
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

        <b-row>
          <b-form-group class="col-12 mt-2">
            <h4>Customeres addresses</h4>
            <hr>
          </b-form-group>
        </b-row>

        <p>Each customer can have up to 5 addresses - 
          <button @click="addNewAddress" v-if="form.addresses.length < 5" class="btn btn-ghost-success btn-sm">ADD NEW <i class="fa fa-plus" /></button>
          <button  v-if="form.addresses.length === 5" class="btn btn-ghost-success btn-sm">MAX REACHED <i class="fa fa-plus" /></button>
        </p>

        <div v-for="(item,index) in form.addresses">  
          <b-row>
          <b-col sm="12">
            <b-form-group class="mt-2">
              <h4>
                Address - <span class="badge badge-success badge-sm">{{index + 1}}</span>
                <small @click="deleteAddress(item,index)" class="badge badge-danger badge-sm float-right">Delete</small>
              </h4>
              
              <hr>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="country">Country</label>
              <b-form-input type="text"  placeholder="Country name" v-model="form.addresses[index].country" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="country">City</label>
              <b-form-input type="text"  placeholder="Country name" v-model="form.addresses[index].city" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="country">State</label>
              <b-form-input type="text"  placeholder="State"  v-model="form.addresses[index].state" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="city">Street</label>
              <b-form-input type="text"  placeholder="Street"   v-model="form.addresses[index].street" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="postal-code">ZIP Code</label>
              <b-form-input type="number"  placeholder="Postal Code"  v-model="form.addresses[index].zip" required></b-form-input>
            </b-form-group>
          </b-col>
          <b-col sm="4">
            <b-form-group>
              <label for="postal-code">Address type</label>
              <b-form-select id="basicSelectLg"
                v-model="form.addresses[index].address_type_id"
                size="lg"
                :plain="true"
                value="Please select"
                required>
                  <option v-for="item in address_types" :value="item.code">{{item.name}}</option>
              </b-form-select>
            </b-form-group>
          </b-col>
          </b-row>     
        </div>
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
    this.getAddressTypes()
  },

  components:{
    'nav-left': NavLeft
  },

  methods:{
    getAddressTypes(){  
      axios.get(config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/addresses_types', {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.address_types = response.data
        }
      })
      .catch((error) => {
        error.response.data.map((m) => {
          this.loading = false
        })
      })
    },

    fetchCustomer(uuid){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/customers/' + uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.form = response.data
          this.form.avatar = response.data.avatar['medium']
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
      if(!this.edit_mode) url =  config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/customers'
      if(this.edit_mode) url  =  config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/customers/' + this.customer_uuid
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
            type: 'success',
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

    deleteAddress(item,index){
      let uuid = item.uuid ? (item.uuid) : ('')
      if(item.uuid){
        axios({
          url:config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/addresses/' + uuid,
          data:this.form,
          method:'DELETE',
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 201 || response.status == 200) {
            this.$toasted.show('Address deleted' , { 
              position:'top-right', 
              duration: 5000,
              type: 'success',
              closeOnSwipe: true
            })
            this.form.addresses.splice(index, 1)
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
          })
        })
      } else {
        this.form.addresses.splice(index, 1)
      }
      
    },

    addNewAddress(e) {
      e.preventDefault()
      this.form.addresses.push({})
    },
    
    reset(){
      this.form = {
        addresses: [{}]
      }
    },

    _handleImageChange(e) {
      e.preventDefault();
      let reader  = new FileReader();
      let file    = e.target.files[0];
      reader.onloadend = () => {
        this.form.avatar =  reader.result
      }
      reader.readAsDataURL(file);
    },

    selectInput(e) {
      let element = document.getElementById("filestyle-0")
      element.click()
    }

  }
  
}
</script>