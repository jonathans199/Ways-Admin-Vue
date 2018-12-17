<template>
  <b-modal  ok-only size="lg" id="modalVariants"  :title="'Times - ' + point.name">
    <div v-if="PickUpTimes.length === 0 && !loading" class="text-center">
      <h2 >No Times Yet</h2>
    </div>
    
    <div v-if="loading" class="text-center mt-5 mb-5">
      <i class="fa fa-circle-o-notch fa-spin fa-fw view__loader fa-lg" ></i>
      <br>
      loading
    </div>
    
    <div v-for="item in PickUpTimes" :key="item.id">
      <div class="row">
        
        <span class="col-4">
          <label for="">Date</label>
          
            <b-form-input class="col-12" :value="item.date" type="date" id="date" /> 

          </b-form-group>
        </span>

        <span class="col-4">
          <label for="">Time</label>
          <input type="text" class="form-control" :value="item.hour" name="" id="">
        </span>
        
        <span class="col-2">
          <label for="">Price</label>
          <input type="text" class="form-control" :value="item.price" name="" id="">
        </span>

        <span class="col-2">
          <button @click="deleteVariant(item)" class="btn btn-default mt-4 text-danger">DELETE <i class="fa fa-times"></i></button>
        </span>
      </div>
    </div>

    <form v-if="show" @submit="createVariant">
      <hr>
      <div class="row">
        <span class="col-4">
          <label for="">Date</label>
          <input type="date" v-model="form.date" class="form-control" name="" id="">
        </span>
        <span class="col-4">
          <label for="">Time</label>
          <input type="text" v-model="form.hour" class="form-control" name="" id="">
        </span>
        <span class="col-2">
          <label for="">Price</label>
          <input type="number" v-model="form.price" class="form-control" name="" id="">
        </span>
        <span class="col-2">
          <button type="submit" class="btn btn-default mt-4">SAVE <i class="fa fa-floppy-o"></i></button>
        </span>
      </div>
    </form>

    <div slot="modal-footer" >
      <button type="button" class="btn btn-warning mr-1" @click="addVariant()">
        New Time
        <i class="fa fa-plus" v-if="!this.show"></i>
        <i class="fa fa-minus" v-if="this.show"></i>
      </button>
      <button type="button" class="btn btn-primary" data-dismiss="modal" @click="hideModal()">Ok</button>
    </div>

  </b-modal>
</template>

<script>
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

export default {
  name:'pointVariant',
  data(){
    return {
      point:{},
      loading: false,
      show: false,
      PickUpTimes:[],
      form:{
        pointID: null
      }
    }
  },

  created(){
    serverBus.$on('variantModal', (point) => {
      this.show = false
      this.form = {}
      this.getPickUpTimes(point)
      this.showModal()
    })
  },

  methods:{

    showModal () {
      this.$root.$emit('bv::show::modal','modalVariants')
    },

    hideModal () {
      this.$root.$emit('bv::hide::modal','modalVariants')
    },

    addVariant(){
      this.show = !this.show
    },
    
    createVariant(e){
      e.preventDefault()
      this.loading = true
      axios({
        url:config.defaultURL + '/api/v1/desk/pick_up_dates?point_id=' + this.form.id,
        data:this.form,
        method:'POST',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          this.$toasted.show('Time successfully created' , {
            position:'top-right', 
            duration: 5000,
            type: 'default',
            closeOnSwipe: true
          })
          this.loading = false
          this.getPickUpTimes(this.point)
        }
      })
      .catch((error) => {
        error.response.data.map((m) => {
          this.$toasted.show(m, { 
            position:'top-right', 
            duration: 5000,
            type: 'default',
            closeOnSwipe: true
          })
          this.loading = false
        })
      })
    },
    
    getPickUpTimes(item){
      this.form.id = item.id
      this.loading = true
      this.point   = item

      axios.get(config.defaultURL + '/api/v1/desk/pick_up_dates?id=' + item.id, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.PickUpTimes = response.data
          this.loading = false
        }
      })
      .catch((error) => {
        error.response.data.map((m) => {
          this.loading = false
        })
      })
    },
    
    deleteVariant(item, next){
      
      if (config.validateDelete()) {
        this.loading = true
        axios({
          url:config.defaultURL + '/api/v1/desk/pick_up_dates/' + item.uuid,
          data:this.form,
          method:'DELETE',
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 200) {
            this.$toasted.show('Time successfully destroyed' , {
              position:'top-right', 
              duration: 5000,
              type: 'danger',
              closeOnSwipe: true
            })
            this.loading = false
            this.getPickUpTimes(this.point)
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
}
</script>
