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
        >
          <template slot="check_mark" slot-scope="data">
            <div class="custom-control custom-checkbox ">
              <input type="checkbox" :id="data.item.id" class="custom-control-input" value="1" >
              <label class="custom-control-label" :for="data.item.id"></label>
            </div>
          </template>

          <template slot="total_spent" slot-scope="data">
            $0 USD
          </template>

          <template slot="action" slot-scope="data">
            <router-link tag="button" :to="'/customers/edit/' + data.item.uuid" class="btn btn-sm btn-primary">
              Details   <i class="fa fa-list"/>
            </router-link>
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
        {key: 'email', sortable: false},
        {key: 'total_spent', sortable: false},
        {key: 'action' , label: '' },
        {key: 'check_mark', sortable: false, label: '' }
      ],
      currentPage: 1,
      perPage: 15,
      totalRows: 0,
      loaders: {},
      show: true,
      loading: false
    }
  },

  created(){
    this.fetchCustomers()
  },

  methods: {
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
