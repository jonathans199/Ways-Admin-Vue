<template>
  <div>
    <top-nav :activeList="true"/>
    <b-card no-body style="border-top: none;" class="col-12">
      <div v-if="loading" class="text-center mt-5 mb-5">
        <i class="fa fa-circle-o-notch fa-spin fa-fw view__loader fa-lg" ></i>
        <br>
        loading
      </div>
      
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
        v-if="!loading"
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
        <template slot="id" slot-scope="data">
          <div class="custom-control custom-checkbox ">
            <input type="checkbox" :id="data.item.id" class="custom-control-input" value="1" >
            <label class="custom-control-label" :for="data.item.id"></label>
          </div>
        </template>

        <template slot="name" slot-scope="data">
          <p>{{data.item.name}}</p>
        </template>

        <template slot="point_type_id" slot-scope="data">
          <p>
            <span v-if="data.item.point_type_id === 12" class="badge badge-success">{{data.item.point_type}}</span>
            <span v-if="data.item.point_type_id === 11" class="badge badge-danger">{{data.item.point_type}}</span>
            <span v-if="data.item.point_type_id === 13" class="badge badge-warning">{{data.item.point_type}}</span>
          </p>
        </template>
        
        <template slot="action" slot-scope="data">
          <router-link tag="button" :to="'/points/edit/' + data.item.uuid" class="btn btn-sm btn-primary">
            Edit <i class="fa fa-pencil"/>
          </router-link>

          <button @click="deletePoint(data.item)" class="btn btn-sm btn-danger ml-1" >
            Delete <i class="fa fa-times"/>
          </button>

          <button 
            class="btn btn-sm btn-warning ml-1" 
            @click="openVariant(data.item)" 
            :disabled="data.item.point_type_id === 11 || data.item.point_type_id === 13 ? (true) : (false)" 
          >
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
        {key: 'name', label:'Name', sortable: true},
        {key: 'point_type_id', label: 'Type', sortable: true},
        {key: 'action', label: 'Action' }
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
    this.listPoints()
  },

  methods: {

    deletePoint(item){
      if (config.validateDelete()) {
        this.loading = true
        axios({
          url:config.defaultURL + '/api/v1/desk/points/' + item.uuid,
          data:this.form,
          method:'DELETE',
          headers: {
            "content-type": "application/json",
            Authorization: localStorage.getItem("auth_token")
          }
        })
        .then(response => {
          if (response.status == 200) {
            this.$toasted.show('Point successfully destroyed' , {
              position:'top-right', 
              duration: 5000,
              type: 'danger',
              closeOnSwipe: true
            })
            this.loading = false
            this.listPoints()
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
    },

    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    }
  }

}
</script>
