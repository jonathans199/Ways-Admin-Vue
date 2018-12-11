<template>
  <div>
    <top-nav :activeList="true"/>

    <b-card no-body style="border-top: none;" class="col-12">
      <b-row class="mt-3">
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Filter" class="mb-0">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Type to Search" />
              <b-input-group-append>
                <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>

        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Per page" class="mb-0">
            <b-form-select :options="pageOptions" v-model="perPage" />
          </b-form-group>
        </b-col>

        <b-col md="12" sm="12" class="my-2">
          <b-form-group horizontal label="Sort" class="mb-0">
            <b-input-group>

              <b-form-select v-model="sortBy" :options="sortOptions">
                <option slot="first" :value="null">-- none --</option>
              </b-form-select>

              <b-form-select :disabled="!sortBy" v-model="sortDesc" slot="append">
                <option :value="false">Asc</option>
                <option :value="true">Desc</option>
              </b-form-select>

            </b-input-group>
          </b-form-group>
        </b-col>  

        
      </b-row>

      <b-table 
        :hover="hover" 
        :striped="striped" 
        :bordered="bordered" 
        :small="small" 
        :fixed="fixed" 
        responsive="sm" 
        :items="items" 
        :fields="fields" 
        :current-page="currentPage" 
        :per-page="perPage"
        :filter="filter"
        @filtered="onFiltered"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :sort-direction="sortDirection"
        class="mt-3"
      >
        <template slot="id" slot-scope="data" >
          <div class="custom-control custom-checkbox " >
            <input type="checkbox" :id="data.item.id" class="custom-control-input" value="1" >
            <label class="custom-control-label" :for="data.item.id"></label>
          </div>
        </template>

        
        <template slot="ride_time" slot-scope="data">
          <span class="badge badge-success">{{data.item.ride_time}}</span>
        </template>

        <template slot="passenger_qty" slot-scope="data">
          <p>{{data.item.ride.passenger_qty}}</p>
        </template>

        <template slot="name" slot-scope="data">
          <p>{{data.item.customer.name}}</p>
        </template>

        <template slot="destiny_point" slot-scope="data">
          <p>{{data.item.destiny_point.name}}</p>
        </template>

        <template slot="phone" slot-scope="data">
          <p>{{data.item.customer.phone}}</p>
        </template>

        <template slot="email" slot-scope="data">
          <p>{{data.item.customer.email}}</p>
        </template>

        <template slot="actions" slot-scope="data">
          <router-link :to="'edit/' + data.item.uuid " class="btn btn-sm btn-primary ml-1" >
            Edit <i class="fa fa-pencil"/>
          </router-link>

          <button @click="deleteRide(data.item)" class="btn btn-sm btn-danger ml-1" >
            Delete <i class="fa fa-times"/>
          </button>

        </template>

      </b-table>
      <nav >
        <b-pagination :total-rows="getRowCount(items)" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" hide-goto-end-buttons/>
      </nav>
    </b-card>
    <modalVariants/>
  </div>
</template>

<style>
  .product__list-image {
    width: 140px;
    height: 140px;
  }

  .table__column-id {
    max-width: 20px !important;
    text-align: center
  }
</style>

<script>
import NavTop from './../Components/NavTop'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'
import _ from 'lodash'
import modalVariants from './../Variants/Add'

export default {
  name:'InventoryList',
  props: {
    server: { type: String },
    hover: {
      type: Boolean,
      default: false
    },
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    sortOptions () {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => { return { text: f.label, value: f.key } })
    }
  },

  components: {
    'top-nav': NavTop,
    modalVariants
  },
  
  

  data(){
    return {
      items: [],
      fields: [
        {key: 'id', sortable: false, label: 'ID', class:'table__column-id'},
        {key: 'date', label: 'Date', sortable: true},
        {key: 'ride_time', label: 'Time', sortable: true },
        {key: 'name' , label: 'Name' },
        {key: 'passenger_qty', label: 'Passengers', sortable: true  },
        {key: 'destiny_point', label: 'Destination', sortable: true  },
        {key: 'phone', label: 'Phone' },
        {key: 'email', label: 'Email' },
        {key: 'actions', label: 'Actions' }
      ],
      currentPage: 1,
      perPage: 30,
      totalRows: 0,
      loaders: {},
      show: true,
      loading: false,
      filter: null,
      pageOptions: [ 5, 10, 15, 20, 25, 30, 40, 50, 100 ],
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc'
    }
  },

  created(){
    this.listRides()
  },

  methods: {
    deleteRide(item){
      if (config.validateDelete()) {
        this.loading = true
        axios({
          url: config.defaultURL + '/api/v1/desk/rides/' + item.ride.uuid,
          data: this.form,
          method:'DELETE',
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 200) {
            this.$toasted.show('Ride successfully destroyed' , {
              position:'top-right', 
              duration: 5000,
              type: 'danger',
              closeOnSwipe: true
            })
            this.loading = false
            this.listRides()
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
          this.loading = false
        })
      }
    },


    openVariant(item){
      serverBus.$emit('variantModal', item)
    },

    listRides(){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/rides', {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.items = response.data.map((ride,index) => {
            ride['done'] = ride.ride_status_id === 11 ? (false) : (true)
            return ride
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
    },

    getBadge (status) {
      return status === 'Active' ? 'success'
        : status === 'Inactive' ? 'secondary'
          : status === 'Pending' ? 'warning'
            : status === 'Banned' ? 'danger' : 'primary'
    },
    
    getRowCount (items) {
      return items.length
    },

    quickStatus(item, featuredEdit){
      let ride_status_id = featuredEdit ? (11) : (12)
      axios({
        url:config.defaultURL + '/api/v1/desk/rides/' + item.uuid,
        data:{
          ride_status_id: ride_status_id
        },
        method:'PUT',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          this.$toasted.show('Ride successfully updated', { 
            position:'top-right', 
            duration: 5000,
            type: 'default',
            closeOnSwipe: true
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

    info (item, index, button) {
      this.modalInfo.title = `Row index: ${index}`
      this.modalInfo.content = JSON.stringify(item, null, 2)
      this.$root.$emit('bv::show::modal', 'modalInfo', button)
    },

    resetModal () {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
    },

    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    }

  }

}
</script>
