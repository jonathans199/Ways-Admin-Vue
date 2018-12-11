<template>
  <div>
    <b-card
      header-tag="header"
      footer-tag="footer">
    <div slot="header">
      <i class="icon-people"></i> <strong>  My customers</strong> - <small>  All</small>
    </div>
    <div class="row">
      <nav-left class="col-2"/>
      <div class="col-10">
        <b-row class="mt-3" v-if="!loading">
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
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          :sort-direction="sortDirection"
          @filtered="onFiltered"
          class="mt-3"
        >

          <template slot="action" slot-scope="data">
            <router-link  tag="button" :to="'/customers/edit/' + data.item.uuid" class="btn btn-sm btn-primary">
              Edit   <i class="fa fa-pencil"/>
            </router-link>

            <button @click="deletePoint(data.item)" class="btn btn-sm btn-danger ml-1" >
              Delete <i class="fa fa-times"/>
            </button>

          </template>

        </b-table>
      <nav>
        <b-pagination :total-rows="getRowCount(items)" :per-page="perPage" v-model="currentPage" prev-text="Prev" next-text="Next" hide-goto-end-buttons/>
      </nav>
      </div>
    </div>
  </b-card>
  </div>
</template>

<script>
import NavLeft from './../Components/NavLeft'
import axios from 'axios'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

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

  components:{
    'nav-left': NavLeft
  },
  
  data(){
    return {
      items: [],
      fields: [
        {key: 'id', sortable: false, label: 'ID' },
        {key: 'name', sortable: false},
        {key: 'email', sortable: false},
        {key: 'phone', sortable: false},
        {key: 'action' , label: '' },
        {key: 'check_mark', sortable: false, label: '' }
      ],
      currentPage: 1,
      perPage: 15,
      totalRows: 0,
      loaders: {},
      show: true,
      loading: false,
      filter: null,
      pageOptions: [ 5, 10, 15, 20, 25, 30, 40, 50, 100 ],
      sortBy: 'point_type_id',
      sortDesc: false,
      sortDirection: 'asc'
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

  created(){
    this.fetchCustomers()
  },

  methods: {
    deletePoint(item){
      if (config.validateDelete()) {
        this.loading = true
        axios({
          url:config.defaultURL + '/api/v1/desk/customers/' + item.uuid,
          data:this.form,
          method:'DELETE',
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 200) {
            this.$toasted.show('Customer successfully destroyed' , {
              position:'top-right', 
              duration: 5000,
              type: 'danger',
              closeOnSwipe: true
            })
            this.loading = false
            this.fetchCustomers()
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

    fetchCustomers(){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/customers', {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.items = response.data.map((product) => {
            // if (product['images'].length == 0) product['images'] = [{ thumb: '/img/products/default.jpg' }]
            return product
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
    }
  }
}
</script>
