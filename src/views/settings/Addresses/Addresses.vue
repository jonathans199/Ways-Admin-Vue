<template>
  <div class="row">
    <div class="col-4">
      <settings/>
    </div>
    <div class="col-8">
      <b-card no-body >
      <nav-top :addresses="true"/>
      <b-collapse id="collapse1" visible>
        <b-card-body>
          <h5>
            Your bussines can have up to 5 different addresses
              - 
            <button @click="addNewAddress" v-if="form.addresses.length < 5" class="btn btn-ghost-success btn-sm">ADD NEW <i class="fa fa-plus" /></button>
            <button  v-if="form.addresses.length === 5" class="btn btn-ghost-success btn-sm">MAX REACHED <i class="fa fa-plus" /></button>
          </h5>
          <hr>
          <form @submit="postStore">
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
              <b-col sm="12">
                <b-form-group>
                  <label for="postal-code">Address type</label>
                  <b-form-select id="basicSelectLg"
                    v-model="form.addresses[index].address_type_id"
                    size="lg"
                    :plain="true"
                    value="Please select">
                      <option v-for="item in address_types" :value="item.code">{{item.name}}</option>
                  </b-form-select>
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
              <b-col sm="8">
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
              
            </b-row>     
            </div>
            <div class="form-actions">
              <b-button v-if="!loading" type="submit" variant="warning" class="mr-2">Save addresses</b-button>
              <b-button v-if="loading" variant="warning" class="mr-2" disabled>Save changes <i class="fa fa-spinner fa-spin"/></b-button>
            </div>
          </form>
        </b-card-body>
      </b-collapse>
      </b-card>
    </div>
    
  </div>
</template>

<script>
import NavTop from './../Components/NavTop'
import Settings from './../Settings/Settings'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

export default {
  components:{
    'nav-top': NavTop,
    'settings': Settings
  },

  data(){
    return{
      loading: false,
      address_types:[],
      form:{
        addresses:[]
      }
    }
  },

  created(){
    this.getAddressTypes()
    serverBus.$on('storeSettingsAddresses', (value) => {
      this.form.addresses = value
    })
  },

  methods:{
    addNewAddress(e){
      e.preventDefault()
      this.form.addresses.push({})
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
          this.$toasted.show('Store addresses updated', { 
            position:'top-right', 
            duration: 5000,
            type: 'success',
            closeOnSwipe: true
          })
          this.form.addresses = response.data.addresses
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

    deleteAddress(item,index){
      let uuid = item.uuid ? (item.uuid) : ('')
      if(item.uuid){
        this.deleteServerAddress(uuid)
      } else {
        this.form.addresses.splice(index, 1)
      }
    },

    deleteServerAddress(uuid){
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
    }
    
  }
}
</script>
