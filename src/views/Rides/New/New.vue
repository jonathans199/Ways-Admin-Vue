<template>
  <div>
    <top-nav v-if="!this.edit_mode" :activeNew="true"/>
    <top-nav v-if="this.edit_mode" :activeEdit="true"/>

    <b-card no-body style="border-top: none;">
      <b-card-body>
        <form @submit="createRide">
         
          <b-row>
            
            <b-form-group class="col-5" label="Name" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="text" v-model="form.customer.name" disabled></b-form-input>
              </b-input-group>
            </b-form-group>
            
            <b-form-group class="col-5" label="Email" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="text" v-model="form.customer.email" disabled></b-form-input>
              </b-input-group>
            </b-form-group>

            <b-form-group class="col-2" label="Phone" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="text" v-model="form.customer.phone" disabled></b-form-input>
              </b-input-group>
            </b-form-group>
          </b-row>

          <hr>

          <b-row>
            <b-form-group v-if="form.pick_up_point.point_type_id != 13" class="col-5" label="Pick Up" label-for="elementsAppend" >
              <b-form-group  class="mb-0">
                <b-form-select v-model="form.ride.starting_point_id" >
                  <option v-for="item in origins" :value="item.id">{{item.name}}</option>
                </b-form-select>
              </b-form-group>
            </b-form-group>

            <b-form-group v-if="form.pick_up_point.point_type_id === 13" class="col-5" label="Pick Address" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="text" v-model="form.pick_up_point.address"></b-form-input>
              </b-input-group>
            </b-form-group>

            
            <b-form-group class="col-5" label="Destiny" label-for="elementsAppend" >
              <b-form-group  class="mb-0">
                <b-form-select  @change="fetchPickUpPoints" v-model="form.ride.destiny_point_id">
                  <option v-for="item in destinies" :value="item.id" >{{item.name}}</option>
                </b-form-select>
              </b-form-group>
            </b-form-group>

            <b-form-group class="col-2" label="Passengers" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="number" v-model="form.ride.passenger_qty"></b-form-input>
              </b-input-group>
            </b-form-group>
          </b-row>

          <b-row>
            <b-form-group v-if="form.pick_up_point.point_type_id === 13" class="col-5" label="Date" label-for="elementsAppend" description="12/15/2018">
              <b-input-group>
                <b-form-input  type="date" v-model="form.pick_up_date.date"></b-form-input>
              </b-input-group>
            </b-form-group>
            
            <b-form-group v-if="form.pick_up_point.point_type_id === 13" class="col-5" label="Hour" label-for="elementsAppend" description="08:00">
              <b-input-group>
                <b-form-input  type="text" v-model="form.pick_up_date.hour"></b-form-input>
              </b-input-group>
            </b-form-group>

            <b-form-group v-if="form.pick_up_point.point_type_id != 13" class="col-10" label="Date and Hour" label-for="elementsAppend" description="12/15/2018">
              <b-form-group  class="mb-0">
                <b-form-select @change="modifiyFormDate" v-model="form.ride.pick_up_date_id" class="is-valid" >
                  <option v-for="item in pick_up_dates_list" :value="item.id" >{{item.date}} - {{item.hour}}</option>
                </b-form-select>
              </b-form-group>
            </b-form-group>

            <b-form-group class="col-2" label="Price" label-for="elementsAppend" >
              <b-input-group>
                <b-form-input  type="text" v-model="form.total" disabled></b-form-input>
                <b-input-group-append><b-input-group-text>USD</b-input-group-text></b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-row>
          
          <hr>

          <b-row>
            <b-form-group
              class="col-12"
              label-sr-only
              >
              <b-form-checkbox-group stacked>
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" id="customChk1"   v-model="form.ride.round_trip" >
                  <label class="custom-control-label" for="customChk1">Round Trip</label>
                </div>
              </b-form-checkbox-group>
            </b-form-group>
          </b-row>

          <hr>

          <b-form-group label="Notes"  label-for="elementsPrependAppend" >
            <b-input-group>
              <b-form-textarea
                state="invalid"
                placeholder="Ride notes"
                v-model="form.ride.notes"
                :rows="3">
              </b-form-textarea>
            </b-input-group>
          </b-form-group>

          <hr>

          <div class="form-actions">
            <div v-if="this.edit_mode">
              <b-button v-if="!loading" type="submit" variant="primary mr-2">Save changes <i class="icon-cloud-upload" /></b-button>
              <b-button v-if="loading" variant="primary mr-2" disabled="">Loading <i class="fa fa-spinner fa-spin" /></b-button>
              <b-button type="button" variant="danger" disabled>Delete ride</b-button>
            </div>
            <div v-else>
              <b-button v-if="!loading" type="submit" variant="warning mr-2">Create Now!</b-button>
              <b-button v-if="loading" variant="warning mr-2" disabled>Loading <i class="fa fa-spinner fa-spin" /></b-button>
              <b-button type="button" variant="secondary" @click="reset">Reset</b-button>
            </div>
          </div>

        </form>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import NavTop from './../Components/NavTop'
import DropZone from './DropZone/DropZone'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'
import Vue from 'vue'
import _ from 'lodash'

export default {
  name:'InventoryNew',
  components: {
    'top-nav': NavTop,
    'drop-zone': DropZone
  },

  data(){
    return {
      ride_uuid: false,
      edit_mode: false,
      loading: false,
      origins: [],
      destinies: [],
      pick_up_dates_list:[],
      form: {
        images:[],
        publish: true,
        ride:{},
        customer:{},
        pick_up_point:{}
      }
    }
  },

  created(){
    this.listPoints()
    if (this.$route.params.uuid) {
      this.edit_mode = true
      this.point_uuid = this.$route.params.uuid
      this.fetchRide(this.$route.params.uuid)
    }
  },


  methods: {

    fetchRide(uuid){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/rides/' + uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.form    = response.data
          this.currentPickDate = response.data.pick_up_date
          this.loading = false
          this.origins.push(response.data.pick_up_point)
          this.destinies.push(response.data.destiny_point)
          // this.pick_up_dates_list.push(response.data.pick_up_date)
          this.fetchPickUpPoints(response.data.destiny_point.id)
        }
      })
      .catch((error) => {
        console.log(error.response)
        this.loading = false
      })
    },

    fetchPickUpPoints(pointID){
      axios.get(config.defaultURL + '/api/v1/desk/pick_up_dates?id=' + pointID, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.pick_up_dates_list = response.data
          if(pointID === this.currentPickDate.id) this.pick_up_dates_list.push(this.currentPickDate)
        }
      })
      .catch((error) => {
        console.log(error.response)
        this.loading = false
      })
    },

    listPoints(){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/points', {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          response.data.map((point,index) => { if (point.point_type_id === 11) this.origins.push(point) })
          response.data.map((point,index) => { if (point.point_type_id === 12) this.destinies.push(point) })
        }
      })
      .catch((error) => {
        console.log(error.response)
        this.loading = false
      })
    },

    createRide(evt){
      evt.preventDefault()
      let url
      let method = this.edit_mode ? ('PUT') : ('POST')
      if(!this.edit_mode) url =  config.defaultURL + '/api/v1/desk/rides'
      if(this.edit_mode) url  =  config.defaultURL + '/api/v1/desk/rides/' + this.form.ride.uuid
      this.loading = true
      axios({
        url: url,
        data: this.form,
        method: method,
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          let msg = this.edit_mode ? ('Ride successfully updated') : ('Ride successfully created')
          this.$toasted.show(msg, {
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

    modifiyFormDate(value){
      console.log(value)
    },

    reset(){
      this.form = {
        publish: true
      }
    }
  }
}
</script>
