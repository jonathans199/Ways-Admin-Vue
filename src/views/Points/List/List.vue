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

        <template slot="name" slot-scope="data">
          <p>{{data.item.name}}</p>
        </template>

        <template slot="Type" slot-scope="data">
          <p>
            <span v-if="data.item.point_type === 'Destination'" class="badge badge-success">{{data.item.point_type}}</span>
            <span v-if="data.item.point_type === 'Origin'" class="badge badge-danger">{{data.item.point_type}}</span>
          </p>
        </template>
        
        <template slot="action" slot-scope="data">
          <router-link tag="button" :to="'/points/edit/' + data.item.uuid" class="btn btn-sm btn-primary">
            Details <i class="fa fa-list"/>
          </router-link>

          <button class="btn btn-sm btn-warning ml-1" @click="openVariant(data.item)"  >
            Times <i class="fa fa-plus"/>
          </button>
        </template>

      </b-table>

      <nav>
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
        {key: 'name', sortable: true},
        {key: 'Type', sortable: true},
        {key: 'action', label: 'Action' }
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
    this.listPoints()
  },

  methods: {
    openVariant(item){
      serverBus.$emit('variantModal', item)
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
          let result = response.data
          this.items = result
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
      let featured = featuredEdit ? (!item.featured) : (item.featured)
      let publish = !featuredEdit ? (!item.publish) : (item.publish)
      axios({
        url:config.defaultURL + '/api/v1/desk/stores/' + config.userStore().uuid + '/points/' + item.uuid,
        data:{
          featured: featured,
          publish: publish
        },
        method:'PUT',
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          this.$toasted.show('Product successfully updated', { 
            position:'top-right', 
            duration: 5000,
            type: 'success',
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
