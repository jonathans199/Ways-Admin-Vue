<template>
  <b-modal  ok-only size="lg" id="modalVariants"  title="Product Variations">
    <div v-if="variations.length === 0" class="text-center">
      <h2 >No Variations Yet</h2>
    </div>
      
    <div v-for="item in variations" :key="item.id">
      <div class="row">
        <span class="col-5">
        <label for="">Name</label>
        <input type="text" class="form-control" :value="item.title" name="" id="">
        </span>
        <span class="col-5">
          <label for="">Stock Quantity</label>
          <input type="text" class="form-control" :value="item.stock_quantity" name="" id="">
        </span>
        <span class="col-2">
          <button @click="deleteVariant(item)" class="btn btn-default mt-4 text-danger">DELETE <i class="fa fa-times"></i></button>
        </span>
      </div>
    </div>

    <form v-if="show" @submit="createVariant">
      <hr>
      <div class="row">
        <span class="col-5">
          <label for="">Name</label>
          <input type="text" v-model="form.title" class="form-control" name="" id="">
        </span>
        <span class="col-5">
          <label for="">Stock Quantity</label>
          <input type="number" v-model="form.stock_quantity" class="form-control" name="" id="">
        </span>
        <span class="col-2">
          <button type="submit" class="btn btn-default mt-4">SAVE <i class="fa fa-floppy-o"></i></button>
        </span>
      </div>
    </form>

    <div slot="modal-footer" >
      <button type="button" class="btn btn-warning mr-1" @click="addVariant()">
        Add Variation 
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
  name:'productVariant',
  data(){
    return {
      product:{},
      loading: false,
      show: false,
      variations:[],
      form:{
        productID: null
      }
    }
  },

  created(){
    serverBus.$on('variantModal', (product) => {
      this.show = false
      this.form = {}
      this.getVariations(product)
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
        url:config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/product_variations',
        data:this.form,
        method:'POST',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          this.$toasted.show('Variation successfully created' , {
            position:'top-right', 
            duration: 5000,
            type: 'success',
            closeOnSwipe: true
          })
          this.loading = false
          this.getVariations({uuid:this.form.product_uuid})
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
    
    getVariations(item){
      this.form.product_uuid = item.uuid
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/product_variations/' + item.uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.variations = response.data
        }
      })
      .catch((error) => {
        error.response.data.map((m) => {
          this.loading = false
        })
      })
    },
    
    deleteVariant(item){
      axios({
        url:config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/product_variations/' + item.uuid,
        data:this.form,
        method:'DELETE',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.$toasted.show('Variation successfully destroyed' , {
            position:'top-right', 
            duration: 5000,
            type: 'danger',
            closeOnSwipe: true
          })
          this.loading = false
          this.getVariations({uuid:this.form.product_uuid})
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
