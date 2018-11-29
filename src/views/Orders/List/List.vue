<template>
  <div>
    <top-nav :activeList="true"/>
    <b-card no-body style="border-top: none;" class="col-12">
      <br>
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
        <template slot="id" slot-scope="data">
          <div class="custom-control custom-checkbox ">
            <input type="checkbox" :id="data.item.id" class="custom-control-input" value="1" >
            <label class="custom-control-label" :for="data.item.id"></label>
          </div>
        </template>

        <template slot="Info" slot-scope="data">
          <p><strong>Total:</strong> ${{data.item.total}}</p>
          <p><strong>No Passengers:</strong> {{data.item.passenger_qty}}</p>
        </template>

        <template slot="Details" slot-scope="data">
          <p><strong>Notes:</strong> {{data.item.notes}}</p>
        </template>


        <template slot="action" slot-scope="data">
          <button tag="button" :to="'/inventory/edit/' + data.item.uuid" class="btn btn-sm btn-primary" disabled>
            Details   <i class="fa fa-list"/>
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

  components: {
    'top-nav': NavTop,
    modalVariants
  },
  
  data(){
    return {
      items: [],
      fields: [
        {key: 'id', sortable: true, label: 'ID', class:'table__column-id'},
        {key: 'Info', sortable: false},
        {key: 'Details', label: 'Details' },
        {key: 'created_at' , label: 'Created At' },
        {key: 'action', label: 'Action' },
        
      ],
      currentPage: 1,
      perPage: 30,
      totalRows: 0,
      loaders: {},
      show: true,
      loading: false
    }
  },

  created(){
    this.listProducts()
  },

  methods: {
    openVariant(item){
      serverBus.$emit('variantModal', item)
    },

    listProducts(){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/orders', {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.items = response.data.map((order,index) => {
            order['done'] = order.order_status_id === 11 ? (false) : (true)
            return order
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
      let order_status_id = featuredEdit ? (11) : (12)
      axios({
        url:config.defaultURL + '/api/v1/desk/orders/' + item.uuid,
        data:{
          order_status_id: order_status_id
        },
        method:'PUT',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          this.$toasted.show('order successfully updated', { 
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
    }
  }

}
</script>
