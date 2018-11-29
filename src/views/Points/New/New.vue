<template>
  <div>
    <top-nav v-if="!this.edit_mode" :activeNew="true"/>
    <top-nav v-if="this.edit_mode" :activeEdit="true"/>
    <b-card no-body style="border-top: none;">
      <b-card-body>
        <form @submit="createpoint">
          <b-form-group label="Name"  label-for="elementsAppend" description="E.g: Port of Miami">
            <b-input-group>
              <b-form-input id="elementsAppend" type="text" v-model="form.name"></b-form-input>
            </b-input-group>
          </b-form-group>

          <b-form-group label="Address"  label-for="elementsAppend" description="E.g: Port of Miami">
            <b-input-group>
              <b-form-input id="elementsAppend" type="text" v-model="form.address"></b-form-input>
            </b-input-group>
          </b-form-group>


          <b-form-group label="Notes"  label-for="elementsPrependAppend"  >
            <b-input-group>
              <b-form-textarea
                state="invalid"
                placeholder=""
                v-model="form.notes"
                :rows="3">
              </b-form-textarea>
            </b-input-group>
          </b-form-group>

          <hr>
          <b-row>
            <b-form-group
              class="col-12"
              label-sr-only
              >
              <b-form-checkbox-group stacked>
                <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" id="customChk1"   v-model="form.publish" >
                  <label class="custom-control-label" for="customChk1">App Only</label>
                </div>
              </b-form-checkbox-group>
            </b-form-group>
          </b-row>
          <hr>
          <b-row>
          
            <b-form-group
            class="col-12"
              label="Point Type"
              label-for="basicRadios"
              :label-cols="3"
              :horizontal="true">
              <b-form-radio-group id="basicRadios"
                v-model="form.point_type_id"
                :plain="true"
                :options="[
                  {text: 'Origin ',value: 11},
                  {text: 'Destiny ',value: 12},
                ]"
                checked={11}
                stacked>
              </b-form-radio-group>
            </b-form-group>
          </b-row>
          <hr>
          <div class="form-actions">
            <div v-if="this.edit_mode">
              <b-button v-if="!loading" type="submit" variant="primary mr-2">Save changes <i class="icon-cloud-upload" /></b-button>
              <b-button v-if="loading" variant="primary mr-2" disabled="">Loading <i class="fa fa-spinner fa-spin" /></b-button>
              <b-button type="button" variant="danger" disabled>Delete point</b-button>
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
import editor from 'vue2-medium-editor'
import Vue from 'vue'



export default {
  name:'pointNew',
  components: {
    'top-nav': NavTop,
    'drop-zone': DropZone,
    'medium-editor': editor
  },

  data(){
    return {
      point_uuid: false,
      edit_mode: false,
      loading: false,
      form: {
        images:[],
        publish: true
      }
    }
  },

  beforeRouteLeave(to, from , next) {
    this.edit_mode = false
    this.point_uuid = false
    this.form =  {
      images:[],
      publish: true
    }
    serverBus.$emit('pointFormReset')
    next()
  },

  created(){
    if (this.$route.params.uuid) {
      this.edit_mode = true
      this.point_uuid = this.$route.params.uuid
      this.fetchpoint(this.$route.params.uuid)
    }
    serverBus.$on('pointDropZoneUpdated', (val) => this.form.images.push(val))
  },

  methods: {
    
    fetchpoint(uuid){
      this.loading = true
      axios.get(config.defaultURL + '/api/v1/desk/points/' + uuid, {
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 200) {
          this.form = response.data
          this.loading = false
          serverBus.$emit('pointEditpoint', response.data.images)
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

    createpoint(evt){
      evt.preventDefault()

      let url
      let method = this.edit_mode ? ('PUT') : ('POST')
      if(!this.edit_mode) url =  config.defaultURL + '/api/v1/desk/points'
      if(this.edit_mode) url =  config.defaultURL + '/api/v1/desk/points/' + this.point_uuid
      this.loading = true
      axios({
        url:url,
        data:this.form,
        method:method,
        headers: {
          "content-type": "application/json",
          Authorization: localStorage.getItem("auth_token")
        }
      })
      .then(response => {
        if (response.status == 201 || response.status == 200) {
          let msg = this.edit_mode ? ('point successfully updated') : ('point successfully created')
          this.$toasted.show(msg, {
            position:'top-right', 
            duration: 5000,
            type: 'success',
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

    reset(){
      this.form = {
        images:[],
        publish: true
      }
      serverBus.$emit('pointFormReset')
    },

    processEditOperation(operation) {

      this.form.content = operation.api.origElements.value 
    } 
  }
}

</script>

<style>

  .medium-toolbar-arrow-under:after{border-color:#428bca transparent transparent;top:60px}.medium-toolbar-arrow-over:before{border-color:transparent transparent #428bca}.medium-editor-toolbar{background-color:#428bca;border:1px solid #357ebd;border-radius:4px}.medium-editor-toolbar li button{background-color:transparent;border:none;border-right:1px solid #357ebd;box-sizing:border-box;color:#fff;height:60px;min-width:60px;-webkit-transition:background-color .2s ease-in,color .2s ease-in;transition:background-color .2s ease-in,color .2s ease-in}.medium-editor-toolbar li .medium-editor-button-active,.medium-editor-toolbar li button:hover{background-color:#3276b1;color:#fff}.medium-editor-toolbar li .medium-editor-button-first{border-bottom-left-radius:4px;border-top-left-radius:4px}.medium-editor-toolbar li .medium-editor-button-last{border-bottom-right-radius:4px;border-right:none;border-top-right-radius:4px}.medium-editor-toolbar-form{background:#428bca;border-radius:4px;color:#fff}.medium-editor-toolbar-form .medium-editor-toolbar-input{background:#428bca;color:#fff;height:60px}.medium-editor-toolbar-form .medium-editor-toolbar-input::-webkit-input-placeholder{color:#fff;color:rgba(255,255,255,.8)}.medium-editor-toolbar-form .medium-editor-toolbar-input:-moz-placeholder{color:#fff;color:rgba(255,255,255,.8)}.medium-editor-toolbar-form .medium-editor-toolbar-input::-moz-placeholder{color:#fff;color:rgba(255,255,255,.8)}.medium-editor-toolbar-form .medium-editor-toolbar-input:-ms-input-placeholder{color:#fff;color:rgba(255,255,255,.8)}.medium-editor-toolbar-form a{color:#fff}.medium-editor-toolbar-anchor-preview{background:#428bca;border-radius:4px;color:#fff}.medium-editor-placeholder:after{color:#357ebd}
  .medium-editor-element {
      min-height: 300px !important;
  }

  @-webkit-keyframes medium-editor-image-loading {
    0% {
      -webkit-transform: scale(0);
              transform: scale(0); }
    100% {
      -webkit-transform: scale(1);
              transform: scale(1); } }

  @keyframes medium-editor-image-loading {
    0% {
      -webkit-transform: scale(0);
              transform: scale(0); }
    100% {
      -webkit-transform: scale(1);
              transform: scale(1); } }

  @-webkit-keyframes medium-editor-pop-upwards {
    0% {
      opacity: 0;
      -webkit-transform: matrix(0.97, 0, 0, 1, 0, 12);
              transform: matrix(0.97, 0, 0, 1, 0, 12); }
    20% {
      opacity: .7;
      -webkit-transform: matrix(0.99, 0, 0, 1, 0, 2);
              transform: matrix(0.99, 0, 0, 1, 0, 2); }
    40% {
      opacity: 1;
      -webkit-transform: matrix(1, 0, 0, 1, 0, -1);
              transform: matrix(1, 0, 0, 1, 0, -1); }
    100% {
      -webkit-transform: matrix(1, 0, 0, 1, 0, 0);
              transform: matrix(1, 0, 0, 1, 0, 0); } }

  @keyframes medium-editor-pop-upwards {
    0% {
      opacity: 0;
      -webkit-transform: matrix(0.97, 0, 0, 1, 0, 12);
              transform: matrix(0.97, 0, 0, 1, 0, 12); }
    20% {
      opacity: .7;
      -webkit-transform: matrix(0.99, 0, 0, 1, 0, 2);
              transform: matrix(0.99, 0, 0, 1, 0, 2); }
    40% {
      opacity: 1;
      -webkit-transform: matrix(1, 0, 0, 1, 0, -1);
              transform: matrix(1, 0, 0, 1, 0, -1); }
    100% {
      -webkit-transform: matrix(1, 0, 0, 1, 0, 0);
              transform: matrix(1, 0, 0, 1, 0, 0); } }

  .medium-editor-anchor-preview {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    left: 0;
    line-height: 1.4;
    max-width: 280px;
    position: absolute;
    text-align: center;
    top: 0;
    word-break: break-all;
    word-wrap: break-word;
    visibility: hidden;
    z-index: 2000; }
    .medium-editor-anchor-preview a {
      color: #fff;
      display: inline-block;
      margin: 5px 5px 10px; }

  .medium-editor-anchor-preview-active {
    visibility: visible; }

  .medium-editor-dragover {
    background: #ddd; }

  .medium-editor-image-loading {
    -webkit-animation: medium-editor-image-loading 1s infinite ease-in-out;
            animation: medium-editor-image-loading 1s infinite ease-in-out;
    background-color: #333;
    border-radius: 100%;
    display: inline-block;
    height: 40px;
    width: 40px; }

  .medium-editor-placeholder {
    position: relative; }
    .medium-editor-placeholder:after {
      content: attr(data-placeholder) !important;
      font-style: italic;
      position: absolute;
      left: 0;
      top: 0;
      white-space: pre;
      padding: inherit;
      margin: inherit; }

  .medium-editor-placeholder-relative {
    position: relative; }
    .medium-editor-placeholder-relative:after {
      content: attr(data-placeholder) !important;
      font-style: italic;
      position: relative;
      white-space: pre;
      padding: inherit;
      margin: inherit; }

  .medium-toolbar-arrow-under:after, .medium-toolbar-arrow-over:before {
    border-style: solid;
    content: '';
    display: block;
    height: 0;
    left: 50%;
    margin-left: -8px;
    position: absolute;
    width: 0; }

  .medium-toolbar-arrow-under:after {
    border-width: 8px 8px 0 8px; }

  .medium-toolbar-arrow-over:before {
    border-width: 0 8px 8px 8px;
    top: -8px; }

  .medium-editor-toolbar {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    left: 0;
    position: absolute;
    top: 0;
    visibility: hidden;
    z-index: 2000; }
    .medium-editor-toolbar ul {
      margin: 0;
      padding: 0; }
    .medium-editor-toolbar li {
      float: left;
      list-style: none;
      margin: 0;
      padding: 0; }
      .medium-editor-toolbar li button {
        box-sizing: border-box;
        cursor: pointer;
        display: block;
        font-size: 14px;
        line-height: 1.33;
        margin: 0;
        padding: 15px;
        text-decoration: none; }
        .medium-editor-toolbar li button:focus {
          outline: none; }
      .medium-editor-toolbar li .medium-editor-action-underline {
        text-decoration: underline; }
      .medium-editor-toolbar li .medium-editor-action-pre {
        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 12px;
        font-weight: 100;
        padding: 15px 0; }

  .medium-editor-toolbar-active {
    visibility: visible; }

  .medium-editor-sticky-toolbar {
    position: fixed;
    top: 1px; }

  .medium-editor-relative-toolbar {
    position: relative; }

  .medium-editor-toolbar-active.medium-editor-stalker-toolbar {
    -webkit-animation: medium-editor-pop-upwards 160ms forwards linear;
            animation: medium-editor-pop-upwards 160ms forwards linear; }

  .medium-editor-action-bold {
    font-weight: bolder; }

  .medium-editor-action-italic {
    font-style: italic; }

  .medium-editor-toolbar-form {
    display: none; }
    .medium-editor-toolbar-form input,
    .medium-editor-toolbar-form a {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .medium-editor-toolbar-form .medium-editor-toolbar-form-row {
      line-height: 14px;
      margin-left: 5px;
      padding-bottom: 5px; }
    .medium-editor-toolbar-form .medium-editor-toolbar-input,
    .medium-editor-toolbar-form label {
      border: none;
      box-sizing: border-box;
      font-size: 14px;
      margin: 0;
      padding: 6px;
      width: 316px;
      display: inline-block; }
      .medium-editor-toolbar-form .medium-editor-toolbar-input:focus,
      .medium-editor-toolbar-form label:focus {
        -webkit-appearance: none;
          -moz-appearance: none;
                appearance: none;
        border: none;
        box-shadow: none;
        outline: 0; }
    .medium-editor-toolbar-form a {
      display: inline-block;
      font-size: 24px;
      font-weight: bolder;
      margin: 0 10px;
      text-decoration: none; }

  .medium-editor-toolbar-form-active {
    display: block; }

  .medium-editor-toolbar-actions:after {
    clear: both;
    content: "";
    display: table; }

  .medium-editor-element {
    word-wrap: break-word;
    min-height: 30px; }
    .medium-editor-element img {
      max-width: 100%; }
    .medium-editor-element sub {
      vertical-align: sub; }
    .medium-editor-element sup {
      vertical-align: super; }

  .medium-editor-hidden {
    display: none; }

</style>

